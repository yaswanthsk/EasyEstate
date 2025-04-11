using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Bussiness_Layer.Interfaces;
using Bussiness_Layer.DTOs.ReviewDto;
using Microsoft.AspNetCore.Authorization;
using ExceptionLayer.Exceptions;


namespace EasyEstate.Controllers
{
    /// <summary>
    /// Controller responsible for handling review-related operations. This includes posting a new review, 
    /// retrieving all reviews, and checking whether a specific user has already submitted a review.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        /// <summary>
        /// Adds a new review.
        /// The method accepts a review DTO as input, validates the request, and calls the service layer 
        /// to persist the review data into the database.
        /// </summary>
        /// <param name="review">The review data containing username, rating, and comments.</param>
        /// <returns>An IActionResult indicating the success or failure of adding the review.</returns>

        [Authorize]

        [HttpPost("PostReview")]
        public async Task<IActionResult> PostReview(ReviewDto review)
        {
            try
            {
                // Validate the model state and review object
                if (!ModelState.IsValid || review == null)
                {
                    return BadRequest(ModelState);
                }

                // Call the service layer to add the review
                var result = await _reviewService.AddReviewAsync(review);
                if (!result)
                {
                    return BadRequest(new { Message = "Data not added" });
                }

                return Ok(new { Message = "Review added successfully" });
            }
            catch (ServiceException ex)
            {
                // Handle known service exceptions
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while adding the review.", Error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves all reviews from the system.
        /// The method calls the service layer to fetch all reviews and returns them to the client. 
        /// If no reviews are found, it returns a 404 response.
        /// </summary>
        /// <returns>An IActionResult containing a list of reviews or an appropriate error message.</returns>

        [HttpGet("GetReview")]
        public async Task<IActionResult> GetReview()
        {
            try
            {
                // Fetch all reviews using the service layer
                var reviews = await _reviewService.GetAllReviewsAsync();

                // Check if reviews were found
                if (reviews == null || !reviews.Any())
                {
                    return NotFound(new { Message = "No reviews found." });
                }

                // Return the reviews in an OK response
                return Ok(reviews);
            }
            catch (ServiceException ex)
            {
                // Handle known service exceptions
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors (e.g., database connectivity issues)
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while fetching reviews.", Error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves a user's review status based on their username.
        /// The method checks if the user has already submitted a review and returns a corresponding message.
        /// If a review exists, a thank-you message is sent; otherwise, the user is prompted to provide feedback.
        /// </summary>
        /// <param name="username">The username of the user whose review status is being retrieved.</param>
        /// <returns>
        /// An IActionResult containing the review status and a message indicating whether a review has been submitted.
        /// </returns>

        [Authorize]
        [HttpGet("GetReviewById/{username}")]
        public async Task<IActionResult> GetReviewById(string username)
        {
            try
            {
                var response = await _reviewService.GetReviewByUsernameAsync(username);

                if (response.HasReviewed)
                {
                    return Ok(new
                    {
                        response.HasReviewed,
                        Message = "Review already submitted. Thank you for your feedback!"
                    });
                }

                return Ok(new
                {
                    response.HasReviewed,
                    Message = "Share your experience with EasyState by leaving a review – we'd love your feedback!"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = "An error occurred while getting user review.",
                    Error = ex.Message
                });
            }
        }
    }
}
