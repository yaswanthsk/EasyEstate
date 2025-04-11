using Bussiness_Layer.DTOs.CartDto;
using Bussiness_Layer.DTOs.PropertyDto;
using Bussiness_Layer.DTOs.StatusDto;
using Bussiness_Layer.Interfaces;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.CartModel;
using Entitiy_Layer.PropertyModel;
using Entitiy_Layer.StatusModel;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// A set of utility methods for handling image data and property requests. 
    /// These methods perform tasks such as splitting byte arrays of concatenated images, 
    /// searching for specific delimiters within byte arrays, and processing user property requests.
    /// </summary>

    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        /// <summary>
        /// Retrieves a list of all properties from the database.
        /// The method fetches properties from the repository, processes their details, and maps them to DTOs
        /// for returning to the client. Each property is enriched with its specific details and image data.
        /// </summary>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of a list of <see cref="PropertiesGetDto"/> objects
        /// containing the property details.
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when a deserialization error occurs for a specific property or if there are issues retrieving data from the repository.
        /// </exception>
        public async Task<List<PropertiesGetDto>> GetAllPropertiesAsync()
        {
            try
            {
                // Fetch properties from the repository
                var properties = await _customerRepository.GetAllPropertiesAsync();

                // Map properties to DTOs
                return properties.Select(property =>
                {
                    try
                    {
                        var images = SplitImagesByDelimiter(property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });
                        var firstImageBase64 = images.FirstOrDefault() != null ? Convert.ToBase64String(images.First()) : null;

                        // Initialize variables for Type and Sqft
                        string type = string.Empty;
                        string sqft = string.Empty;

                        // Deserialize SpecificDetails based on PropertyType
                        if (property.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                        {
                            var land = JsonSerializer.Deserialize<Lands_Plots>(property.SpecificDetails);
                            if (land != null)
                            {
                                type = land.Type;
                                sqft = land.PlotArea;
                            }
                        }
                        else if (property.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                        {
                            var house = JsonSerializer.Deserialize<Houses_Apartments>(property.SpecificDetails);
                            if (house != null)
                            {
                                type = house.Type;
                                sqft = house.Sqft;
                            }
                        }
                        else if (property.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                        {
                            var pg = JsonSerializer.Deserialize<PG_GuestHouses>(property.SpecificDetails);
                            if (pg != null)
                            {
                                type = pg.Type;
                            }
                        }
                        else if (property.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                        {
                            var shop = JsonSerializer.Deserialize<Shops_Offices>(property.SpecificDetails);
                            if (shop != null)
                            {
                                type = shop.Type;
                                sqft = shop.Sqft;
                            }
                        }

                        return new PropertiesGetDto
                        {
                            PropertyID = property.PropertyID,
                            OwnerID = property.OwnerID,
                            PropertyName = property.PropertyName,
                            PropertyLocation = property.PropertyLocation,
                            OwnerMobileNo = property.OwnerMobileNO,
                            PropertyType = property.PropertyType,
                            PropertyPrice = property.PropertyPrice,
                            PropertyDescription = property.PropertyDescription,
                            PropertyFor = property.TransactionType,
                            Type = type, // Include the resolved Type
                            Sqft = sqft, // Include the resolved Sqft
                            PropertyImage = firstImageBase64
                        };
                    }
                    catch (JsonException ex)
                    {
                        throw new BusinessException($"Deserialization error for property ID {property.PropertyID}.", ex);
                    }
                }).ToList();
            }
            catch (RepositoryException ex)
            {
                // Wrap repository exceptions in a business exception
                throw new BusinessException("An error occurred while fetching property data.", ex);
            }
            catch (Exception ex)
            {
                // Handle any other unexpected exceptions
                throw new BusinessException("An unexpected error occurred in the service layer.", ex);
            }
        }



        /// <summary>
        /// Sends a request to the owner of a property. 
        /// This method validates the input, checks for duplicate requests, and adds a new property request to the database.
        /// </summary>
        /// <param name="propStatusPostDto">The details of the property request to be sent.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref="ValidationException">
        /// Thrown when the input details are invalid, such as missing required fields.
        /// </exception>
        /// <exception cref="DuplicateRequestException">
        /// Thrown when a request for the specified property has already been sent.
        /// </exception>
        /// <exception cref="BusinessException">
        /// Thrown when an error occurs while interacting with the repository or if an unexpected exception occurs.
        /// </exception>

        public async Task SendRequestAsync(PropStatusPostDto propStatusPostDto)
        {
            try
            {
                // Validate the input
                if (propStatusPostDto == null)
                {
                    throw new ValidationException("Request details cannot be null.");
                }

                if (string.IsNullOrEmpty(propStatusPostDto.OwnerID))
                {
                    throw new ValidationException("OwnerID is required.");
                }

                // Check if a request has already been sent
                var isAlreadySent = await IsRequestAlreadySentAsync(propStatusPostDto.UserId, propStatusPostDto.PropertyID);
                if (isAlreadySent)
                {
                    throw new DuplicateRequestException("Request for this property has already been sent.");
                }

                // Map DTO to Entity Model
                var propStatus = new PropStatus
                {
                    UserId = propStatusPostDto.UserId,
                    PropertyID = propStatusPostDto.PropertyID,
                    OwnerID = propStatusPostDto.OwnerID,
                    StatusType = propStatusPostDto.StatusType,
                };

                // Add new PropStatus record
                await _customerRepository.AddRequestAsync(propStatus);
            }
            catch (RepositoryException ex)
            {
                // Wrap repository exception in a business exception
                throw new BusinessException("An error occurred while adding the property request.", ex);
            }
            catch (ValidationException)
            {
                // Validation exceptions should bubble up
                throw;
            }
            catch (DuplicateRequestException)
            {
                // Duplicate request exceptions should bubble up
                throw;
            }
            catch (Exception ex)
            {
                // Catch all other exceptions and wrap them as a business exception
                throw new BusinessException("An unexpected error occurred while sending the property request.", ex);
            }
        }



        /// <summary>
        /// Checks whether a request for a specific property has already been sent by a user.
        /// This method queries the repository to determine if a status record exists for the given user and property.
        /// </summary>
        /// <param name="userId">The ID of the user sending the request.</param>
        /// <param name="propertyId">The ID of the property being requested.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of <c>true</c> if a request already exists; otherwise, <c>false</c>.
        /// </returns>

        public async Task<bool> IsRequestAlreadySentAsync(string userId, int propertyId)
        {
            var status = await _customerRepository.GetStatusByUserIdAndPropertyIdAsync(userId, propertyId);
            return status != null;
        }

        /// <summary>
        /// Removes a property request for a specified user and property.
        /// This method deletes the request from the repository if it exists.
        /// </summary>
        /// <param name="userId">The ID of the user who sent the request.</param>
        /// <param name="propertyId">The ID of the property for which the request was sent.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of <c>true</c> if the request was successfully removed; otherwise, <c>false</c>.
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when the request does not exist or an error occurs while accessing the repository or service layer.
        /// </exception>
        public async Task<bool> RemoveRequestAsync(string userId, int propertyId)
        {
            try
            {
                var result = await _customerRepository.RemoveRequestAsync(userId, propertyId);

                if (!result)
                {
                    throw new BusinessException($"Request not found for UserId: {userId} and PropertyId: {propertyId}");
                }

                return result;
            }
            catch (RepositoryException ex)
            {
                throw new BusinessException("An error occurred while accessing the data store.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("An unexpected error occurred in the service.", ex);
            }
        }


        /// <summary>
        /// Adds a property to the user's cart (wishlist). 
        /// Validates the input, checks for duplicates, and persists the cart item to the database.
        /// </summary>
        /// <param name="cartDto">The details of the cart item to be added, including the property ID and user ID.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of a <see cref="string"/> indicating 
        /// the outcome of the operation (e.g., success message or duplicate warning).
        /// </returns>
        /// <exception cref="ArgumentException">
        /// Thrown when the input cart details are invalid, such as missing or incorrect property ID or user ID.
        /// </exception>
        /// <exception cref="BusinessException">
        /// Thrown when an error occurs while interacting with the repository or if an unexpected exception occurs.
        /// </exception>
        public async Task<string> AddToCartAsync(CartDto cartDto)
        {
            try
            {
                // Validate input
                if (cartDto == null || cartDto.PropertyID <= 0 || string.IsNullOrEmpty(cartDto.UserID))
                {
                    throw new ArgumentException("Invalid cart details.");
                }

                // Check if the property is already in the cart
                var existingCartItem = await _customerRepository.GetCartItemAsync(cartDto.UserID, cartDto.PropertyID);
                if (existingCartItem != null)
                {
                    return "Property is already in your wishlist.";
                }

                // Map DTO to entity and add to the database
                var cartItem = new Cart
                {
                    PropertyID = cartDto.PropertyID,
                    UserID = cartDto.UserID
                };

                await _customerRepository.AddCartItemAsync(cartItem);

                return "Item added to your wishlist successfully.";
            }
            catch (ArgumentException)
            {
                // Rethrow validation exceptions to be handled by the controller
                throw;
            }
            catch (RepositoryException ex)
            {
                throw new BusinessException("An error occurred while processing your cart request.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("An unexpected error occurred while adding the item to the cart.", ex);
            }
        }


        /// <summary>
        /// Retrieves the list of items in the user's cart. 
        /// This method fetches cart items from the repository, processes property-specific details, and maps them to DTOs for the client.
        /// </summary>
        /// <param name="userId">The ID of the user whose cart items are to be retrieved.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of a list of <see cref="CartGetDto"/> objects
        /// containing details of the properties in the cart.
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when no items are found in the cart or when an error occurs while processing the cart request.
        /// </exception>

        public async Task<List<CartGetDto>> ViewCartWithSoldAsync(string userId)
        {
            {
                try
                {
                    // Get sold-out and available properties from the repository
                    var soldOutProperties = await _customerRepository.GetSoldOutCartItemsAsync(userId);

                    if (soldOutProperties == null)
                    {
                        //throw new BusinessException("No items found in the cart.");
                        return (null);
                    }

                    // Map sold-out properties to DTOs
                    var soldOutPropertiesDto = soldOutProperties.Select(cart =>
                    {
                        var C_Type = "";
                        var P_sqft = "";

                        // Deserialize property-specific details based on property type
                        if (cart.Property.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                        {
                            var land = JsonSerializer.Deserialize<Lands_Plots>(cart.Property.SpecificDetails);
                            if (land != null)
                            {
                                C_Type = land.Type;
                                P_sqft = land.PlotArea;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                        {
                            var house = JsonSerializer.Deserialize<Houses_Apartments>(cart.Property.SpecificDetails);
                            if (house != null)
                            {
                                C_Type = house.Type;
                                P_sqft = house.Sqft;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                        {
                            var pg = JsonSerializer.Deserialize<PG_GuestHouses>(cart.Property.SpecificDetails);
                            if (pg != null)
                            {
                                C_Type = pg.Type;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                        {
                            var shop = JsonSerializer.Deserialize<Shops_Offices>(cart.Property.SpecificDetails);
                            if (shop != null)
                            {
                                C_Type = shop.Type;
                                P_sqft = shop.Sqft;
                            }
                        }

                        // Extract the first image
                        var images = SplitImagesByDelimiter(cart.Property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });
                        var firstImageBase64 = images.FirstOrDefault() != null
                            ? Convert.ToBase64String(images.First())
                            : null;

                        return new CartGetDto
                        {
                            CartID = cart.CartID,
                            PropertyID = cart.PropertyID,
                            PropertyDetails = new PropertiesGetCartDto
                            {
                                PropertyName = cart.Property.PropertyName,
                                PropertyLocation = cart.Property.PropertyLocation,
                                PropertyPrice = cart.Property.PropertyPrice,
                                PropertyDescription = cart.Property.PropertyDescription,
                                OwnerMobileNo = cart.Property.OwnerMobileNO,
                                OwnerID = cart.Property.OwnerID,
                                PropertyImage = firstImageBase64,
                                PropertyFor = cart.Property.TransactionType,
                                Type = C_Type,
                                Sqft = P_sqft,
                                PropertyType = cart.Property.PropertyType,
                            }
                        };
                    }).ToList();
                    // Map sold-out properties to DTOs
                    return (soldOutPropertiesDto);
                }
                catch (BusinessException)
                {
                    throw; // Rethrow business-specific exceptions for the controller to handle
                }
                catch (RepositoryException ex)
                {
                    throw new BusinessException("An error occurred while processing your cart request.", ex);
                }
                catch (Exception ex)
                {
                    throw new BusinessException("An unexpected error occurred while fetching cart items.", ex);
                }
            }
        }


        public async Task<List<CartGetDto>> ViewCartWithAvailableAsync(string userId)
        {
            {
                try
                {
                    // Get sold-out and available properties from the repository
                    var availableProperties = await _customerRepository.GetAvailableCartItemsAsync(userId);

                    if (availableProperties == null)
                    {
                        //throw new BusinessException("No items found in the cart.");
                        return (null);
                    }

                    // Map sold-out properties to DTOs

                    var availablePropertiesDto = availableProperties.Select(cart =>
                    {
                        var C_Type = "";
                        var P_sqft = "";

                        // Deserialize property-specific details based on property type
                        if (cart.Property.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                        {
                            var land = JsonSerializer.Deserialize<Lands_Plots>(cart.Property.SpecificDetails);
                            if (land != null)
                            {
                                C_Type = land.Type;
                                P_sqft = land.PlotArea;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                        {
                            var house = JsonSerializer.Deserialize<Houses_Apartments>(cart.Property.SpecificDetails);
                            if (house != null)
                            {
                                C_Type = house.Type;
                                P_sqft = house.Sqft;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                        {
                            var pg = JsonSerializer.Deserialize<PG_GuestHouses>(cart.Property.SpecificDetails);
                            if (pg != null)
                            {
                                C_Type = pg.Type;
                            }
                        }
                        else if (cart.Property.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                        {
                            var shop = JsonSerializer.Deserialize<Shops_Offices>(cart.Property.SpecificDetails);
                            if (shop != null)
                            {
                                C_Type = shop.Type;
                                P_sqft = shop.Sqft;
                            }
                        }

                        // Extract the first image
                        var images = SplitImagesByDelimiter(cart.Property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });
                        var firstImageBase64 = images.FirstOrDefault() != null
                            ? Convert.ToBase64String(images.First())
                            : null;

                        return new CartGetDto
                        {
                            CartID = cart.CartID,
                            PropertyID = cart.PropertyID,
                            PropertyDetails = new PropertiesGetCartDto
                            {
                                PropertyName = cart.Property.PropertyName,
                                PropertyLocation = cart.Property.PropertyLocation,
                                PropertyPrice = cart.Property.PropertyPrice,
                                PropertyDescription = cart.Property.PropertyDescription,
                                OwnerMobileNo = cart.Property.OwnerMobileNO,
                                OwnerID = cart.Property.OwnerID,
                                PropertyImage = firstImageBase64,
                                PropertyFor = cart.Property.TransactionType,
                                Type = C_Type,
                                Sqft = P_sqft,
                                PropertyType = cart.Property.PropertyType,
                            }
                        };
                    }).ToList();
                    // Map sold-out properties to DTOs
                    return (availablePropertiesDto);
                }
                catch (BusinessException)
                {
                    throw; // Rethrow business-specific exceptions for the controller to handle
                }
                catch (RepositoryException ex)
                {
                    throw new BusinessException("An error occurred while processing your cart request.", ex);
                }
                catch (Exception ex)
                {
                    throw new BusinessException("An unexpected error occurred while fetching cart items.", ex);
                }
            }
        }





        /// <summary>
        /// Removes a specific property item from the user's cart. 
        /// Validates the existence of the cart item before attempting removal.
        /// </summary>
        /// <param name="userId">The ID of the user whose cart item is to be removed.</param>
        /// <param name="propertyId">The ID of the property to be removed from the cart.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of <c>true</c> if the item was successfully removed;
        /// otherwise, <c>false</c> if the item was not found in the cart.
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when an error occurs while interacting with the repository or if an unexpected exception occurs.
        /// </exception>

        // Remove item from cart based on userId and propertyId
        public async Task<bool> RemoveItemFromCartAsync(string userId, int propertyId)
        {
            try
            {
                var cartItem = await _customerRepository.GetCartItemAsync(userId, propertyId);

                if (cartItem == null)
                {
                    return false; // Item not found
                }

                await _customerRepository.RemoveCartItemAsync(cartItem);
                return true; // Successfully removed
            }
            catch (RepositoryException ex)
            {
                // Log exception (optional) and rethrow as a business exception
                throw new BusinessException("An error occurred while processing the remove item request.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("An unexpected error occurred in the service layer.", ex);
            }
        }


        /// <summary>
        /// Clears all items from the user's cart. 
        /// Validates the user ID and removes all items associated with the user's cart if any exist.
        /// </summary>
        /// <param name="userId">The ID of the user whose cart items are to be cleared.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a tuple containing:
        /// <c>IsSuccess</c> (a <see cref="bool"/> indicating if the operation was successful) and 
        /// <c>Message</c> (a <see cref="string"/> providing additional details about the operation outcome).
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when an error occurs while interacting with the repository or if an unexpected exception occurs.
        /// </exception>
        //clear cart
        public async Task<(bool IsSuccess, string Message)> ClearCartAsync(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return (false, "User ID is required.");
                }

                // Fetch all items in the user's cart
                var cartItems = await _customerRepository.GetCartItemsByUserIdAsync(userId);

                if (!cartItems.Any())
                {
                    return (false, "No items found in the cart to clear.");
                }

                // Remove all items in the cart
                await _customerRepository.RemoveCartItemsAsync(cartItems);
                return (true, "All items removed from your cart successfully.");
            }
            catch (RepositoryException ex)
            {
                throw new BusinessException("An error occurred while clearing the cart.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("An unexpected error occurred while processing your request.", ex);
            }
        }


        /// <summary>
        /// Retrieves the list of items in the user's wishlist (cart). 
        /// This method fetches the cart items from the repository and maps them to DTOs for the client.
        /// </summary>
        /// <param name="userId">The ID of the user whose wishlist items are to be retrieved.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of a list of <see cref="CartDto"/> objects 
        /// containing the details of the properties in the wishlist. Returns <c>null</c> if no items are found.
        /// </returns>
        /// <exception cref="ServiceException">
        /// Thrown when an error occurs while interacting with the repository or if an unexpected exception occurs.
        /// </exception>
        public async Task<List<CartDto>> GetWishlistItemsAsync(string userId)
        {
            try
            {
                // Call repository method to get cart items
                var cartItems = await _customerRepository.GetCartItemsByUserIdAsync(userId);

                if (cartItems == null || !cartItems.Any())
                {
                    return null; // No items found
                }

                // Map the cart items to DTOs
                return cartItems.Select(cart => new CartDto
                {
                    UserID = cart.UserID,
                    PropertyID = cart.PropertyID
                }).ToList();
            }
            catch (RepositoryException ex)
            {
                throw new ServiceException("An error occurred while retrieving the wishlist items.", ex);
            }
            catch (Exception ex)
            {
                throw new ServiceException("An unexpected error occurred while processing the request.", ex);
            }
        }






        /// <summary>
        /// Retrieves the list of requests made by a specific user, including detailed property information.
        /// This method fetches property status details from the repository, processes the property-specific information, 
        /// and maps it to a DTO for the client.
        /// </summary>
        /// <param name="userId">The ID of the user whose requests are to be retrieved.</param>
        /// <returns>
        /// A task representing the asynchronous operation, with a result of a list of <see cref="PropStatusDto"/> objects 
        /// containing the details of the requests made by the user.
        /// </returns>
        /// <exception cref="BusinessException">
        /// Thrown when an error occurs while processing the user requests or during data deserialization.
        /// </exception>
        public async Task<List<PropStatusDto>> GetUserRequestsAsync(string userId)
        {
            try
            {
                // Fetch property statuses with details from the repository
                var propStatusList = await _customerRepository.GetPropStatusWithDetailsByUserIdAsync(userId);

                // Check if the list is empty
                if (!propStatusList.Any())
                {
                    throw new InvalidOperationException("No requests found for the given UserId.");
                }

                return propStatusList.Select(ps =>
                {
                    try
                    {
                        // Deserialize property details and split images
                        var images = SplitImagesByDelimiter(ps.Property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });

                        string C_Type = string.Empty;
                        string P_sqft = string.Empty;

                        if (ps.Property.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                        {
                            var land = JsonSerializer.Deserialize<Lands_Plots>(ps.Property.SpecificDetails);
                            if (land != null)
                            {
                                C_Type = land.Type;
                                P_sqft = land.PlotArea;
                            }
                        }
                        else if (ps.Property.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                        {
                            var house = JsonSerializer.Deserialize<Houses_Apartments>(ps.Property.SpecificDetails);
                            if (house != null)
                            {
                                C_Type = house.Type;
                                P_sqft = house.Sqft;
                            }
                        }
                        else if (ps.Property.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                        {
                            var pg = JsonSerializer.Deserialize<PG_GuestHouses>(ps.Property.SpecificDetails);
                            if (pg != null)
                            {
                                C_Type = pg.Type;
                            }
                        }
                        else if (ps.Property.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                        {
                            var shop = JsonSerializer.Deserialize<Shops_Offices>(ps.Property.SpecificDetails);
                            if (shop != null)
                            {
                                C_Type = shop.Type;
                                P_sqft = shop.Sqft;
                            }
                        }

                        var firstImageBase64 = images.FirstOrDefault() != null
                            ? Convert.ToBase64String(images.First())
                            : null;

                        // Map data to DTO
                        return new PropStatusDto
                        {
                            UserId = ps.UserId,
                            PropertyID = ps.PropertyID,
                            OwnerID = ps.OwnerID,
                            StatusType = ps.StatusType,
                            PropertyDetails = new PropertiesGetViewDto
                            {
                                PropertyName = ps.Property.PropertyName,
                                OwnerID = ps.Property.OwnerID,
                                PropertyFor = ps.Property.TransactionType,
                                OwnerMobileNo = ps.Property.OwnerMobileNO,
                                PropertyLocation = ps.Property.PropertyLocation,
                                PropertyPrice = ps.Property.PropertyPrice,
                                PropertyDescription = ps.Property.PropertyDescription,
                                PropertyType = ps.Property.PropertyType,
                                Type = C_Type,
                                Sqft = P_sqft,
                                PropertyImage = firstImageBase64
                            }
                        };
                    }
                    catch (JsonException ex)
                    {
                        throw new BusinessException($"Error deserializing property details for property ID {ps.PropertyID}.", ex);
                    }
                }).ToList();
            }
            catch (RepositoryException ex)
            {
                throw new BusinessException("An error occurred while fetching user requests.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("An unexpected error occurred in the service layer.", ex);
            }
        }


        /// <summary>
        /// Splits a byte array containing multiple images separated by a specified delimiter.
        /// This method searches for the delimiter within the image data and splits the data into separate image byte arrays.
        /// </summary>
        /// <param name="imageData">The byte array containing the concatenated image data to be split.</param>
        /// <param name="delimiter">The byte array representing the delimiter that separates the images in the data.</param>
        /// <returns>
        /// A list of byte arrays, where each byte array represents an individual image from the original image data.
        /// </returns>
        private List<byte[]> SplitImagesByDelimiter(byte[] imageData, byte[] delimiter)
        {
            var images = new List<byte[]>();
            int start = 0, index;

            while ((index = FindDelimiter(imageData, delimiter, start)) >= 0)
            {
                int length = index - start;
                byte[] image = new byte[length];
                Array.Copy(imageData, start, image, 0, length);
                images.Add(image);
                start = index + delimiter.Length;
            }

            if (start < imageData.Length)
            {
                byte[] lastImage = new byte[imageData.Length - start];
                Array.Copy(imageData, start, lastImage, 0, lastImage.Length);
                images.Add(lastImage);
            }

            return images;
        }

        /// <summary>
        /// Searches for the first occurrence of a specified delimiter within a byte array, starting from a given position.
        /// This method checks if the delimiter sequence exists in the data array and returns the index of its first occurrence.
        /// </summary>
        /// <param name="data">The byte array in which to search for the delimiter.</param>
        /// <param name="delimiter">The byte array representing the delimiter to search for.</param>
        /// <param name="start">The starting index from which to begin the search.</param>
        /// <returns>
        /// The index of the first occurrence of the delimiter within the data array, or -1 if the delimiter is not found.
        /// </returns>
        private int FindDelimiter(byte[] data, byte[] delimiter, int start)
        {
            for (int i = start; i <= data.Length - delimiter.Length; i++)
            {
                if (data.Skip(i).Take(delimiter.Length).SequenceEqual(delimiter))
                {
                    return i;
                }
            }
            return -1;
        }
    }
}
