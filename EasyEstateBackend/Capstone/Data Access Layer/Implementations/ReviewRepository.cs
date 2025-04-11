using Data_Access_Layer.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer;
using Entitiy_Layer.ReviewModel;
using Data_Access_Layer.Data;
using Microsoft.EntityFrameworkCore;
using ExceptionLayer.Exceptions;


namespace Data_Access_Layer.Implementations
{
    /// <summary>
    /// Repository for managing review-related database operations. This class provides functionality 
    /// to add reviews, retrieve all reviews, and fetch a specific review by username.
    /// </summary>

    public class ReviewRepository : IReviewRepository
    {
        private readonly AuthDbContext _dbContext;

        public ReviewRepository(AuthDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Adds a new review to the database asynchronously.
        /// </summary>
        /// <param name="review">The review entity containing user feedback and rating details.</param>
        /// <returns>
        /// A <see cref="Task{Boolean}"/> representing the asynchronous operation, returning 
        /// true if the review is successfully added; otherwise, false.
        /// </returns>
        /// <exception cref="RepositoryException">Thrown if there is an error while adding the review to the database.</exception>
        public async Task<bool> AddReviewAsync(Review review)
        {
            try
            {
                // Add the review to the DbContext
                await _dbContext.Reviews.AddAsync(review);

                // Save changes to the database
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // Log the exception and throw a custom exception
                throw new RepositoryException("Error adding review to the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves all reviews from the database asynchronously.
        /// </summary>
        /// <returns>
        /// A <see cref="Task{IEnumerable{Review}}"/> representing the asynchronous operation, 
        /// containing a list of all reviews.
        /// </returns>
        /// <exception cref="RepositoryException">Thrown if an error occurs while fetching reviews from the database.</exception>

        public async Task<IEnumerable<Review>> GetAllReviewsAsync()
        {
            try
            {
                // Fetch all reviews from the database
                return await _dbContext.Reviews.ToListAsync();
            }
            catch (Exception ex)
            {
                // Log and throw a custom exception if there's an issue fetching data
                throw new RepositoryException("An error occurred while fetching reviews from the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves a specific review by username asynchronously.
        /// </summary>
        /// <param name="username">The username of the user whose review is to be fetched.</param>
        /// <returns>
        /// A <see cref="Task{Review}"/> representing the asynchronous operation, containing the 
        /// review entity if found; otherwise, null.
        /// </returns>

        public async Task<Review?> GetReviewByUsernameAsync(string username)
        {
            return await _dbContext.Reviews
                                   .Where(u => u.Username == username)
                                   .FirstOrDefaultAsync();
        }
    }
}
