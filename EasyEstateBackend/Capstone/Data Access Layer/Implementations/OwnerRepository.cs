using Data_Access_Layer.Data;
using Data_Access_Layer.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.PropertyModel;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Identity;
using Entitiy_Layer.StatusModel;
using Microsoft.EntityFrameworkCore;
using ExceptionLayer.Exceptions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Data_Access_Layer.Implementations
{
    /// <summary>
    /// Repository to manage property-related data operations for owners. It provides methods for adding, updating, deleting properties, 
    /// retrieving property details, and managing property statuses. The repository interacts with the database context and uses the 
    /// UserManager to manage user details. It includes functionality for fetching customer requests and handling property status updates.
    /// This class encapsulates the database operations and throws custom exceptions for error handling.
    /// </summary>

    public class OwnerRepository : IOwnerRepository
    {
        private readonly AuthDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;

        public OwnerRepository(AuthDbContext dbContext, UserManager<ApplicationUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        /// <summary>
        /// Adds a new property to the database.
        /// </summary>
        /// <param name="pro">The property object to be added to the database.</param>
        /// <returns>A boolean indicating whether the property was successfully added (true) or not (false).</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while adding the property to the database.</exception>

        public async Task<bool> AddPropertyAsync(Properties pro)
        {
            try
            {
                // Add the property to the database context
                _dbContext.Properties.Add(pro);

                // Save changes to the database
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // Catch any exceptions that occur while interacting with the database
                throw new RepositoryException("An error occurred while adding the property.", ex);
            }
        }

        /// <summary>
        /// Retrieves a property by its ID from the database.
        /// </summary>
        /// <param name="id">The ID of the property to be retrieved.</param>
        /// <returns>The property with the specified ID, or null if not found.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while retrieving the property from the database.</exception>

        public async Task<Properties> GetPropertyByIdAsync(int id)
        {
            try
            {
                // Retrieve the property by its ID from the database
                return await _dbContext.Properties.FindAsync(id);
            }
            catch (Exception ex)
            {
                // Log the exception and throw a custom exception
                throw new RepositoryException("Error fetching property from the database.", ex);
            }
        }

        //add
        public async Task<bool> UpdateMultiplePropertiesAsync(IEnumerable<PropStatus> properties)
        {
            _dbContext.Status.UpdateRange(properties);
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<PropStatus>> GetPropertiesByPropertyIDAsync(int propertyID)
        {
            return await _dbContext.Status.Where(p => p.PropertyID == propertyID && p.StatusType != "Sold").ToListAsync();
        }







        /// <summary>
        /// Updates an existing property in the database.
        /// </summary>
        /// <param name="property">The property to be updated in the database.</param>
        /// <returns>A boolean indicating whether the property was successfully updated.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while updating the property in the database.</exception>

        public async Task<bool> UpdatePropertyAsync(Properties property)
        {
            try
            {
                // Update the existing property in the database context
                _dbContext.Properties.Update(property);

                // Save the changes and return a success/failure flag
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // Log the exception and throw a custom exception
                throw new RepositoryException("Error updating property in the database.", ex);
            }
        }

        /// <summary>
        /// Deletes a property from the database.
        /// </summary>
        /// <param name="property">The property to be deleted from the database.</param>
        /// <returns>A boolean indicating whether the property was successfully deleted.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while deleting the property from the database.</exception>

        public async Task<bool> DeletePropertyAsync(Properties property)
        {
            try
            {
                _dbContext.Properties.Remove(property);
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // Log the exception and throw a custom exception
                throw new RepositoryException("Error deleting property from the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves a list of properties that belong to a specific owner.
        /// </summary>
        /// <param name="ownerId">The ID of the owner whose properties are to be fetched.</param>
        /// <returns>A list of properties associated with the given owner ID.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while fetching the properties from the database.</exception>

        public async Task<List<Properties>> GetPropertiesByOwnerAsync(string ownerId)
        {
            try
            {
                // Fetch the properties belonging to the specific owner
                return await _dbContext.Properties
                    .Where(p => p.OwnerID == ownerId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                // Log the exception if needed
                throw new RepositoryException("Error fetching properties from the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves the details of an owner by their ID.
        /// </summary>
        /// <param name="ownerId">The ID of the owner whose details are to be fetched.</param>
        /// <returns>The details of the owner as an `ApplicationUser` object.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while fetching the owner details from the database.</exception>

        public async Task<ApplicationUser> GetOwnerDetailsByIdAsync(string ownerId)
        {
            try
            {
                // Retrieve owner details using UserManager
                return await _userManager.FindByIdAsync(ownerId);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error fetching owner details from the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves the details of a user by their ID.
        /// </summary>
        /// <param name="userId">The ID of the user whose details are to be fetched.</param>
        /// <returns>The details of the user as an `ApplicationUser` object.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while fetching the user details from the database.</exception>

        public async Task<ApplicationUser> GetUserDetailsByIdAsync(string userId)
        {
            try
            {
                // Fetch user details from the database
                return await _userManager.FindByIdAsync(userId);
            }
            catch (Exception ex)
            {
                // Handle exceptions if necessary
                throw new RepositoryException("Error fetching user details from the database.", ex);
            }
        }


        /// <summary>
        /// Retrieves the status of a property for a specific owner and user.
        /// </summary>
        /// <param name="propertyId">The ID of the property whose status is to be fetched.</param>
        /// <param name="ownerId">The ID of the owner of the property.</param>
        /// <param name="userId">The ID of the user associated with the property status.</param>
        /// <returns>The property status as a `PropStatus` object, or null if no matching status is found.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while fetching the property status from the database.</exception>

        public async Task<PropStatus> GetPropertyStatusAsync(int propertyId, string ownerId, string userId)
        {
            try
            {
                // Fetch the property status from the database
                return await _dbContext.Status
                                       .FirstOrDefaultAsync(s => s.PropertyID == propertyId
                                                              && s.OwnerID == ownerId
                                                              && s.UserId == userId);
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                throw new RepositoryException("Error fetching property status from the database.", ex);
            }
        }


        /// <summary>
        /// Updates the status of a property in the database.
        /// </summary>
        /// <param name="existingStatus">The property status object containing updated information.</param>
        /// <returns>A boolean indicating whether the property status was successfully updated (true) or not (false).</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while updating the property status in the database.</exception>

        public async Task<bool> UpdatePropertyStatusAsync(PropStatus existingStatus)
        {
            try
            {
                // Update the property status
                _dbContext.Status.Update(existingStatus);

                // Save changes to the database
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // Log exception if necessary
                throw new RepositoryException("Error updating property status in the database.", ex);
            }
        }


        /// <summary>
        /// Retrieves a list of property statuses for a specific owner, including related property details.
        /// </summary>
        /// <param name="ownerId">The ID of the owner for whom the property statuses are being fetched.</param>
        /// <returns>A list of property status objects for the specified owner.</returns>
        /// <exception cref="RepositoryException">Thrown when an error occurs while fetching the customer requests from the database.</exception>
        public async Task<List<PropStatus>> GetCustomerRequestsByOwnerAsync(string ownerId)
        {
            try
            {
                // Fetch property statuses for the given owner ID
                return await _dbContext.Status
                                       .Where(s => s.OwnerID == ownerId)
                                       .Include(s => s.Property) // Include related property details
                                       .ToListAsync();
            }
            catch (Exception ex)
            {
                // Handle database errors if necessary
                throw new RepositoryException("Error fetching customer requests from the database.", ex);
            }
        }


    }

}
