using Data_Access_Layer.Data;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.CartModel;
using Entitiy_Layer.PropertyModel;
using Entitiy_Layer.StatusModel;
using ExceptionLayer.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Access_Layer.Implementations
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AuthDbContext _dbContext;

        public CustomerRepository(AuthDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<PropStatus>> getsoldprop()
        {
            try
            {
                return await _dbContext.Status.Where(s => s.StatusType == "Soldout").ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while retrieving properties from the database.", ex);
            }
        }


        /// <summary>
        /// Retrieves all properties from the database.
        /// </summary>
        /// <returns>A list of all properties.</returns>
        public async Task<List<Properties>> GetAllPropertiesAsync()
        {
            try
            {
                // Retrieve the list of sold properties
                var soldoutlist = await getsoldprop();

                // Retrieve all properties
                var allprop = await _dbContext.Property.ToListAsync();

                // Filter out sold properties
                var availableProperties = allprop.Where(p => !soldoutlist.Any(s => s.PropertyID == p.PropertyID)).ToList();

                return availableProperties;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while retrieving properties from the database.", ex);
            }
        }

        /// <summary>
        /// Adds a property status request to the database.
        /// </summary>
        /// <param name="propStatus">The property status to add.</param>
        /// <returns>True if the request is added successfully, otherwise false.</returns>
        public async Task<bool> AddRequestAsync(PropStatus propStatus)
        {
            try
            {
                await _dbContext.Status.AddAsync(propStatus);
                return await _dbContext.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while adding the property status to the database.", ex);
            }
        }

        /// <summary>
        /// Retrieves a property status by user ID and property ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="propertyId">The ID of the property.</param>
        /// <returns>The property status if found, otherwise null.</returns>
        public async Task<PropStatus> GetStatusByUserIdAndPropertyIdAsync(string userId, int propertyId)
        {
            return await _dbContext.Status
                .FirstOrDefaultAsync(p => p.UserId == userId && p.PropertyID == propertyId);
        }


        /// <summary>
        /// Removes a property status request from the database.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="propertyId">The ID of the property.</param>
        /// <returns>True if the request is removed successfully, otherwise false.</returns>
        /// <exception cref="RepositoryException">Thrown when there is an error removing the property status.</exception>
        public async Task<bool> RemoveRequestAsync(string userId, int propertyId)
        {
            try
            {
                var status = await _dbContext.Status.FirstOrDefaultAsync(s => s.UserId == userId && s.PropertyID == propertyId);
                if (status != null)
                {
                    _dbContext.Status.Remove(status);
                    return await _dbContext.SaveChangesAsync() > 0;
                }
                return false;
            }
            catch (DbUpdateException ex)
            {
                throw new RepositoryException("Error occurred while updating the database.", ex);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An unexpected error occurred in the repository.", ex);
            }
        }





        /// <summary>
        /// Retrieves items that are soldout in a user's cart.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of cart items with property details.</returns>
        /// 


        public async Task<List<Cart>> GetSoldOutCartItemsAsync(string userId)
        {
            try
            {
                // Fetch the user's cart with included property details
                var userCart = await _dbContext.CustomerCart
                    .Where(c => c.UserID == userId)
                    .Include(c => c.Property) // Include related property details
                    .ToListAsync();

                // Fetch all sold-out property IDs
                var soldOutPropertyIds = await _dbContext.Status
                    .Where(s => s.StatusType == "Soldout")
                    .Select(s => s.PropertyID)
                    .ToListAsync();

                // Filter sold-out cart items
                var soldOutProperties = userCart
                    .Where(c => soldOutPropertyIds.Contains(c.PropertyID))
                    .ToList();

                return soldOutProperties;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while fetching sold-out cart items.", ex);
            }
        }


        /// <summary>
        /// Retrieves items that are available in a user's cart.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of cart items with property details.</returns>
        /// 

        public async Task<List<Cart>> GetAvailableCartItemsAsync(string userId)
        {
            try
            {
                // Fetch the user's cart with included property details
                var userCart = await _dbContext.CustomerCart
                    .Where(c => c.UserID == userId)
                    .Include(c => c.Property) // Include related property details
                    .ToListAsync();

                // Fetch all sold-out property IDs
                var soldOutPropertyIds = await _dbContext.Status
                    .Where(s => s.StatusType == "Soldout")
                    .Select(s => s.PropertyID)
                    .ToListAsync();

                // Filter available cart items
                var availableProperties = userCart
                    .Where(c => !soldOutPropertyIds.Contains(c.PropertyID))
                    .ToList();

                return availableProperties;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while fetching available cart items.", ex);
            }
        }


        //public async Task<List<Cart>> ViewCartAsync(string userId)
        //{
        //    try
        //    {
        //        return await _dbContext.CustomerCart
        //            .Where(c => c.UserID == userId)
        //            .Include(c => c.Property) // Include related property details
        //            .ToListAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new RepositoryException("An error occurred while fetching cart items from the database.", ex);
        //    }
        //}




        /// <summary>
        /// Removes multiple items from the user's cart.
        /// </summary>
        /// <param name="cartItems">The items to remove from the cart.</param>
        public async Task RemoveCartItemsAsync(IEnumerable<Cart> cartItems)
        {
            try
            {
                _dbContext.CustomerCart.RemoveRange(cartItems);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while removing cart items.", ex);
            }
        }

        /// <summary>
        /// Retrieves all items in a user's wishlist.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of wishlist items with property details.</returns>
        public async Task<List<Cart>> ViewWishlistAsync(string userId)
        {
            return await _dbContext.CustomerCart
                .Where(c => c.UserID == userId)
                .Include(c => c.Property)
                .ToListAsync();
        }


        /// <summary>
        /// Retrieves a specific cart item by user ID and property ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="propertyId">The ID of the property.</param>
        /// <returns>The cart item if found, otherwise null.</returns>
        public async Task<Cart> GetCartItemAsync(string userId, int propertyId)
        {
            try
            {
                return await _dbContext.CustomerCart
                    .FirstOrDefaultAsync(c => c.UserID == userId && c.PropertyID == propertyId);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while fetching the cart item.", ex);
            }
        }

        /// <summary>
        /// Adds a new cart item to the user's cart.
        /// </summary>
        /// <param name="cartItem">The cart item to add.</param>
        public async Task AddCartItemAsync(Cart cartItem)
        {
            try
            {
                _dbContext.CustomerCart.Add(cartItem);
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new RepositoryException("Database update failed while adding the cart item.", ex);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An unexpected error occurred while adding the cart item.", ex);
            }
        }

        /// <summary>
        /// Removes a specific cart item from the user's cart.
        /// </summary>
        /// <param name="cartItem">The cart item to remove.</param>
        public async Task RemoveCartItemAsync(Cart cartItem)
        {
            try
            {
                _dbContext.CustomerCart.Remove(cartItem);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while removing the cart item.", ex);
            }
        }


        /// <summary>
        /// Retrieves all cart items for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of cart items with property details.</returns>

        public async Task<List<Cart>> GetCartItemsByUserIdAsync(string userId)
        {
            try
            {
                return await _dbContext.CustomerCart
                    .Where(c => c.UserID == userId)
                    .Include(c => c.Property) // Ensure related properties are included
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while fetching cart items for the user.", ex);
            }
        }




        /// <summary>
        /// Retrieves all property status records for a specific user, including property details.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of property statuses with details.</returns>
        public async Task<List<PropStatus>> GetPropStatusWithDetailsByUserIdAsync(string userId)
        {
            try
            {
                return await _dbContext.Status
                    .Where(ps => ps.UserId == userId)
                    .Include(ps => ps.Property) // Include related Property details
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("An error occurred while retrieving property status by user ID.", ex);
            }
        }

    }
}
