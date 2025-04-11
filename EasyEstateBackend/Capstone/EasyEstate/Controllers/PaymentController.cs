using Bussiness_Layer.DTOs.PaymentDto;
using Bussiness_Layer.Implementations;
using Data_Access_Layer.Data;
using Entitiy_Layer.PaymentModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EasyEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly AuthDbContext _dbContext;
        private readonly RazorPay _razorpayService;

        public PaymentController(AuthDbContext dbContext, RazorPay razorpayService)
        {
            _dbContext = dbContext;
            _razorpayService = razorpayService;
        }

        [HttpPost("initiate-payment")]
        public async Task<IActionResult> InitiatePayment([FromBody] TemporaryPaymentDto tempPayment)
        {
            if (string.IsNullOrEmpty(tempPayment.UserId) || tempPayment.Amount <= 0 || string.IsNullOrEmpty(tempPayment.Plan))
            {
                return BadRequest(new { error = "Invalid input data" });
            }

                try
                {
                    var order = _razorpayService.CreateOrder(tempPayment.Amount, "INR", $"receipt_{tempPayment.Plan}");
                    var newTempPayment = new TemporaryPayment
                    {
                        UserId = tempPayment.UserId,
                        Amount = tempPayment.Amount,
                        Plan = tempPayment.Plan,
                        OrderId = order["id"],
                        CreatedAt = DateTime.UtcNow
                    };

                    _dbContext.TemporaryPayments.Add(newTempPayment);
                    await _dbContext.SaveChangesAsync();

                    return Ok(new { orderId = newTempPayment.OrderId });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating payment: {ex.Message}");
                    return StatusCode(500, new { error = "Internal Server Error" });
                }
        }





        [HttpPost("confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PermanentPaymentDto paymentResponse)
        {
            try
            {
                string paymentId = paymentResponse.paymentId;
                string orderId = paymentResponse.orderId;

                // Retrieve Temp Payment
                var tempPayment = _dbContext.TemporaryPayments.FirstOrDefault(tp => tp.OrderId == orderId);
                if (tempPayment == null)
                {
                    return NotFound(new { error = "Order not found" });
                }

                // Save Permanent Payment
                var permanentPayment = new PermanentPayment
                {
                    UserId = tempPayment.UserId,
                    Amount = tempPayment.Amount,
                    Plan = tempPayment.Plan,
                    PaymentId = paymentId,
                    PaidAt = DateTime.UtcNow
                };

                _dbContext.PermanentPayments.Add(permanentPayment);
                _dbContext.TemporaryPayments.Remove(tempPayment);
                await _dbContext.SaveChangesAsync();

                return Ok(new { status = "success" });
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error confirming payment: {ex.Message}");
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }



        [HttpPut("update-subscription/{userId}")]
        public async Task<IActionResult> UpdateSubscription(string userid,[FromBody] PermanentPaymentDto updatepayment)
        {
            try
            {
                string paymentId = updatepayment.paymentId;
                string orderId = updatepayment.orderId;

                // Retrieve Temp Payment
                var tempPayment = _dbContext.TemporaryPayments.FirstOrDefault(tp => tp.OrderId == orderId);
                var paymentRecord = await _dbContext.PermanentPayments.FirstOrDefaultAsync(pp => pp.UserId == userid);

                if (tempPayment == null)
                {
                    return NotFound(new { error = "Order not found" });
                }

                // Save Permanent Payment

                paymentRecord.Amount = tempPayment.Amount;
                paymentRecord.Plan = tempPayment.Plan;
                paymentRecord.PaymentId = paymentId;
                paymentRecord.PaidAt = DateTime.UtcNow;
                paymentRecord.ActiveStatus = true;



                _dbContext.TemporaryPayments.Remove(tempPayment);
                await _dbContext.SaveChangesAsync();

                return Ok(new { status = "success" });
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error confirming payment: {ex.Message}");
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }



        [HttpPost("update-subscription-status/{userId}")]
        public async Task<IActionResult> UpdateSubscriptionStatus(string userId)
        {
            try
            {
                var subscriptionRecord = await _dbContext.PermanentPayments
    .FirstOrDefaultAsync(pp => pp.UserId == userId);

                if (subscriptionRecord == null)
                {
                    return Ok(new { status = "newuser", message = "No subscription record found for the user." });
                }
                else if (subscriptionRecord!=null) {
                    var currentTime = DateTime.UtcNow;
                    //var plan = 0;

                    //            var expiredSubscription = await _dbContext.PermanentPayments
                    //.FirstOrDefaultAsync(pp => pp.UserId == userId.ToString() &&
                    //                            pp.PaidAt.AddMonths(plan).AddMinutes(+3) <= currentTime); // Check if subscription is expired

                    var expiredSubscription = (await _dbContext.PermanentPayments
    .Where(pp => pp.UserId == userId.ToString() && pp.ActiveStatus == true)
    .ToListAsync()) // Fetch data to memory
    .FirstOrDefault(pp => pp.PaidAt.AddMonths(int.Parse(pp.Plan)) <= currentTime);



                    if (expiredSubscription == null && subscriptionRecord.ActiveStatus==true)
                    {

                        //DateTime expiryDate = subscriptionRecord.PaidAt.AddMonths(0).AddMinutes(+3);


                        // Calculate the expiry date by adding months to PaidAt
                        DateTime expiryDate = subscriptionRecord.PaidAt.AddMonths(int.Parse(subscriptionRecord.Plan));

                        // Calculate the remaining days
                        int remainingDays = (expiryDate - DateTime.UtcNow).Days;

                        // If the remaining days are negative, it means the subscription has expired
                        if (remainingDays < 0)
                        {
                            remainingDays = 0;
                        }

                        // Prepare the result with Plan, PaidAt, and remaining days
                        var result = new
                        {
                            Plan = subscriptionRecord.Plan,
                            PaidAt = subscriptionRecord.PaidAt,
                            RemainingDays = remainingDays,
                        };

                        return Ok(new { status = "activeuser", data = result, message = "Your Subscription is active" });
                    }
                    else if(expiredSubscription != null)
                    {
                        
                            subscriptionRecord.ActiveStatus = false; // Mark as inactive

                        // Save changes to the database
                        await _dbContext.SaveChangesAsync();

                        return Ok(new { status = "renewaluser", message = "renew the subscription" });
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating subscription status: {ex.Message}");
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }
    }
}
