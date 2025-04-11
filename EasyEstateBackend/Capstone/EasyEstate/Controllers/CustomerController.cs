using Bussiness_Layer.DTOs.CartDto;
using Bussiness_Layer.DTOs.StatusDto;
using Bussiness_Layer.Interfaces;
using Entitiy_Layer.CartModel;
using Entitiy_Layer.StatusModel;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EasyEstate.Controllers
{
    /// <summary>
    /// Controller responsible for handling customer-related actions such as property requests, cart management, and wishlist operations.
    /// The controller provides endpoints for viewing properties, sending requests, managing carts, and viewing or removing items from a wishlist.
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Retrieves all properties available in the database.
        /// The method calls the service to fetch the list of properties and returns them to the client.
        /// It handles validation, business logic, and general exceptions to ensure the response is meaningful and appropriate.
        /// </summary>
        [HttpGet("GetAllProperties")]
        public async Task<IActionResult> GetAllProperties()
        {
            try
            {
                // Call the service to get properties
                var properties = await _customerService.GetAllPropertiesAsync();
                return Ok(properties);
            }
            catch (ValidationException ex)
            {
                // Bad Request for validation errors
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (BusinessException ex)
            {
                // Internal Server Error for business exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message, Details = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                // General Internal Server Error
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred.", Details = ex.Message });
            }
        }


        /// <summary>
        /// Allows a customer to send a request regarding a property to the owner.
        /// The method validates the request and passes the request details to the service to be processed.
        /// It handles various exceptions such as validation, duplicate requests, and business logic errors to provide meaningful feedback to the user.
        /// </summary>
        /// <param name="propStatusPostDto">The details of the request to be sent to the property owner.</param>
        /// <returns>An IActionResult indicating the success or failure of the request submission.</returns>
        [HttpPost("SendRequest")]
        public async Task<IActionResult> SendRequest([FromBody] PropStatusPostDto propStatusPostDto)
        {
            try
            {
                // Call the service to handle the request
                await _customerService.SendRequestAsync(propStatusPostDto);

                return Ok(new { Status = "Success", Message = "Request sent to owner successfully." });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (DuplicateRequestException ex)
            {
                return Conflict(new { Status = "Warning", Message = ex.Message });
            }
            catch (BusinessException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred." });
            }
        }



        /// <summary>
        /// Allows a user to view all of their property requests.
        /// The method retrieves the user's requests and returns them as a list of property status details.
        /// If the user ID is invalid or the requests are not found, appropriate error messages are returned.
        /// </summary>
        /// <param name="userId">The ID of the user whose property requests are to be viewed.</param>
        /// <returns>An IActionResult containing the list of property requests or an error message if the requests are not found.</returns>

        [HttpGet("ViewMyRequests/{userId}")]
        public async Task<IActionResult> ViewMyRequests(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Status = "Error", Message = "UserId is required." });
            }

            try
            {
                var propStatusDtoList = await _customerService.GetUserRequestsAsync(userId);

                return Ok(new { Status = "Success", Data = propStatusDtoList });
            }
            catch (InvalidOperationException ex)
            {
                // Return 404 Not Found for missing requests
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (BusinessException ex)
            {
                // Return 500 Internal Server Error for business-related issues
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message, Details = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                // Return 500 Internal Server Error for any unexpected issues
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred.", Details = ex.Message });
            }
        }


        /// <summary>
        /// Allows a user to remove a property request.
        /// The method attempts to remove a request for a specific property by the user.
        /// If the request is not found, a 404 error is returned. If any business logic issues arise, a 400 error is returned.
        /// </summary>
        /// <param name="userId">The ID of the user making the request to remove a property request.</param>
        /// <param name="propertyId">The ID of the property associated with the request to be removed.</param>
        /// <returns>An IActionResult indicating the success or failure of the request removal.</returns>

        [HttpDelete("DeleteRequest/{userId}/{propertyId}")]
        public async Task<IActionResult> RemoveRequest(string userId, int propertyId)
        {
            try
            {
                var result = await _customerService.RemoveRequestAsync(userId, propertyId);

                if (result)
                {
                    return Ok(new { Status = "Success", Message = "Request removed successfully" });
                }

                return NotFound(new { Status = "Error", Message = "Request not found" });
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }


        /// <summary>
        /// Allows a user to add an item to their shopping cart.
        /// The method accepts a CartDto object, which contains the item details, and calls the service to add it to the cart.
        /// If validation or business logic errors occur, appropriate error responses are returned. If successful, a success message is returned.
        /// </summary>
        /// <param name="cartDto">The details of the item to be added to the shopping cart.</param>
        /// <returns>An IActionResult indicating the success or failure of the operation.</returns>
        [HttpPost("AddToCart")]
        public async Task<IActionResult> AddToCart([FromBody] CartDto cartDto)
        {
            try
            {
                // Call the service to add the item to the cart
                string result = await _customerService.AddToCartAsync(cartDto);
                return Ok(new { Status = "Success", Message = result });
            }
            catch (ArgumentException ex)
            {
                // Handle validation errors
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (BusinessException ex)
            {
                // Handle business logic errors
                return Conflict(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred." });
            }
        }


        /// <summary>
        /// Allows a user to view the items in their shopping cart.
        /// The method takes the user ID as input, retrieves the cart items from the service, and returns them in the response.
        /// If business logic errors occur, a NotFound status is returned. Any unexpected errors result in a server error response.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose cart is to be viewed.</param>
        /// <returns>An IActionResult indicating the success or failure of the operation and the cart data if successful.</returns>

        [HttpGet("ViewCartSold/{userId}")]


        public async Task<IActionResult> ViewCartSold(string userId)
        {
            try
            {
                // Call the service to get cart items
                var cartItems = await _customerService.ViewCartWithSoldAsync(userId);
                if (cartItems == null)
                {
                    return Ok(new { Status = "Success", Data = cartItems });
                }

                // Return success response with cart items
                return Ok(new { Status = "Success", Data = cartItems });
            }
            catch (BusinessException ex)
            {
                // Handle business-specific exceptions
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred." });
            }
        }

        [HttpGet("ViewCartAvailable/{userId}")]

        public async Task<IActionResult> ViewCartAvailable(string userId)
        {
            try
            {
                // Call the service to get cart items
                var cartItems = await _customerService.ViewCartWithAvailableAsync(userId);
                if (cartItems == null)
                {
                    return Ok(new { Status = "Success", Data = cartItems });
                }

                // Return success response with cart items
                return Ok(new { Status = "Success", Data = cartItems });
            }
            catch (BusinessException ex)
            {
                // Handle business-specific exceptions
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "An unexpected error occurred." });
            }
        }



        /// <summary>
        /// Allows a user to remove an item from their shopping cart.
        /// The method takes the user ID and property ID as input, validates them, and then calls the service to remove the item from the cart.
        /// If the item is not found in the cart, a NotFound response is returned. If there are any business logic errors, a BadRequest response is sent.
        /// Any unexpected errors result in a server error response.
        /// </summary>
        /// <param name="UserId">The unique identifier of the user whose cart is being modified.</param>
        /// <param name="PropertyId">The unique identifier of the property to be removed from the user's cart.</param>
        /// <returns>An IActionResult indicating the success or failure of the operation.</returns>
        [HttpDelete("RemoveFromCart/{UserId}/{PropertyId}")]
        public async Task<IActionResult> RemoveFromCart(string UserId, int PropertyId)
        {
            // Validate input
            if (string.IsNullOrEmpty(UserId) || PropertyId <= 0)
            {
                return BadRequest(new { Status = "Error", Message = "Invalid UserId or PropertyID." });
            }

            try
            {
                // Call the service to remove the item from the cart
                var result = await _customerService.RemoveItemFromCartAsync(UserId, PropertyId);

                if (!result)
                {
                    return NotFound(new { Status = "Error", Message = "Item not found in the cart." });
                }

                return Ok(new { Status = "Success", Message = "Item removed from your cart." });
            }
            catch (BusinessException ex)
            {
                // Handle known business exceptions
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }



        /// <summary>
        /// Allows a user to clear all items from their shopping cart.
        /// The method takes the user ID as input and calls the service to clear the cart. 
        /// If the operation is unsuccessful, a BadRequest response is returned with the error message.
        /// On success, a message indicating that the cart has been cleared is returned.
        /// Any known business exceptions return a BadRequest response, while any unexpected errors result in a server error response.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose cart is to be cleared.</param>
        /// <returns>An IActionResult indicating the success or failure of the operation.</returns>
        [HttpDelete("ClearCart/{userId}")]
        public async Task<IActionResult> ClearCart(string userId)
        {
            try
            {
                // Call the service to clear the cart
                var result = await _customerService.ClearCartAsync(userId);

                if (!result.IsSuccess)
                {
                    return BadRequest(new { Status = "Error", Message = result.Message });
                }

                return Ok(new { Status = "Success", Message = result.Message });
            }
            catch (BusinessException ex)
            {
                // Handle known business exceptions
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }


        /// <summary>
        /// Retrieves the wishlist items for a user.
        /// The method takes the user ID as input and calls the service to get the user's wishlist items. 
        /// If no items are found, a NotFound response is returned with a message indicating the wishlist is empty.
        /// If the input is invalid, a BadRequest response is returned indicating the missing user ID.
        /// Any known service exceptions result in a BadRequest response with the error message, while unexpected errors trigger a server error response.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose wishlist is to be retrieved.</param>
        /// <returns>An IActionResult indicating the success or failure of the operation, including the wishlist items if successful.</returns>

        [HttpGet("ViewWishlist/{userId}")]
        public async Task<IActionResult> ViewWishlist(string userId)
        {
            // Validate input
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Status = "Error", Message = "User ID is required." });
            }

            try
            {
                // Retrieve the wishlist items using the service
                var cartDtos = await _customerService.GetWishlistItemsAsync(userId);

                if (cartDtos == null || !cartDtos.Any())
                {
                    return Ok(new { Status = "notfound", Message = "No items in your wishlist.",CartItems=cartDtos });
                }

                return Ok(new { Status = "Success", CartItems = cartDtos });
            }
            catch (ServiceException ex)
            {
                // Handle known service exceptions
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }

    }
}
