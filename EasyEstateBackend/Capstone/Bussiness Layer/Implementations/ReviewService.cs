using Bussiness_Layer.DTOs.ReviewDto;
using Bussiness_Layer.Interfaces;
using Data_Access_Layer.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.ReviewModel;
using System.Xml.Linq;
using Bussiness_Layer.DTOs.PropertyDto;
using ExceptionLayer.Exceptions;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// Service responsible for handling review-related actions such as adding, fetching, and checking reviews.
    /// The service interacts with the repository layer to persist and retrieve review data, mapping between DTOs and entities as needed.
    /// Methods include adding a review, fetching all reviews, and checking if a user has posted a review by username.
    /// </summary>

    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        /// <summary>
        /// Adds a review to the system. This method maps the provided `ReviewDto` to a `Review` entity and calls the repository
        /// to persist the review data. If an error occurs during the process, it throws a custom exception with an error message.
        /// </summary>
        /// <param name="review">The review data transfer object containing the username, rating, and comments for the review.</param>
        /// <returns>A boolean indicating whether the review was successfully added.</returns>
        /// <exception cref="ServiceException">Thrown when an error occurs while processing the review.</exception>

        public async Task<bool> AddReviewAsync(ReviewDto review)
        {
            try
            {
                // Map the DTO to the Review entity
                var reviewEntity = new Review
                {
                    Username = review.Username,
                    Rating = review.Rating,
                    Comments = review.Comments
                };

                // Call the repository to add the review
                return await _reviewRepository.AddReviewAsync(reviewEntity);
            }
            catch (Exception ex)
            {
                // Log the exception and throw a custom exception
                throw new ServiceException("An error occurred while processing the review.", ex);
            }
        }

        /// <summary>
        /// Retrieves all reviews from the system.
        /// The method fetches review data from the repository, maps it to DTO objects, and returns the results.
        /// </summary>
        /// <returns>
        /// A collection of <see cref="ReviewDto"/> objects containing the username, rating, and comments for each review.
        /// </returns>
        /// <exception cref="ServiceException">
        /// Thrown when an error occurs while fetching or processing the reviews.
        /// </exception>

        public async Task<IEnumerable<ReviewDto>> GetAllReviewsAsync()
        {
            try
            {
                // Get all reviews from the repository
                var reviews = await _reviewRepository.GetAllReviewsAsync();

                // Map Review entities to ReviewDto objects
                return reviews.Select(review => new ReviewDto
                {
                    Username = review.Username,
                    Rating = review.Rating,
                    Comments = review.Comments
                }).ToList();
            }
            catch (Exception ex)
            {
                // Handle errors that may occur during the service layer execution
                throw new ServiceException("An error occurred while processing the reviews.", ex);
            }
        }

        /// <summary>
        /// Retrieves all reviews from the system. This method fetches the reviews from the repository, maps them to `ReviewDto` objects,
        /// and returns a list of reviews with relevant details including the username, rating, and comments.
        /// </summary>
        /// <returns>A list of `ReviewDto` objects containing review details such as username, rating, and comments.</returns>
        /// <exception cref="ServiceException">Thrown when an error occurs while processing the reviews.</exception>

        public async Task<Review> GetReviewByUsernameAsync(string username)
        {
            try
            {
                var review = await _reviewRepository.GetReviewByUsernameAsync(username);

                return new Review
                {
                    HasReviewed = review != null
                };
            }
            catch (Exception ex)
            {
                // Handle service layer exceptions
                throw new ServiceException("An error occurred while processing the review by username.", ex);
            }
        }

    }
}
