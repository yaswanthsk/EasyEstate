using Bussiness_Layer.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bussiness_Layer.DTOs.PropertyDto;
using Entitiy_Layer.PropertyModel;
using Azure.Core;
using System.Text.Json;
using Data_Access_Layer.Interfaces;
using Data_Access_Layer.Data;
using Microsoft.EntityFrameworkCore;
using Bussiness_Layer.DTOs;
using Bussiness_Layer.DTOs.StatusDto;
using Data_Access_Layer.Implementations;
using Microsoft.AspNetCore.Mvc;
using ExceptionLayer.Exceptions;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// Service layer to handle property-related operations for owners. It includes logic for managing properties (adding, updating, deleting), 
    /// retrieving property details, and handling customer requests and property statuses. 
    /// It interacts with the repository layer to fetch and update data related to properties, users, and statuses.
    /// </summary>

    public class OwnerService : IOwnerService
    {
        private readonly IOwnerRepository _ownerRepository;

        public OwnerService(IOwnerRepository ownerRepository)
        {
            _ownerRepository = ownerRepository;
        }

        /// <summary>
        /// Asynchronously adds a property to the system.
        /// This method validates the input DTO, maps the data to the database model, 
        /// serializes specific property type details, processes images, and invokes 
        /// the repository to save the property in the database.
        /// </summary>
        /// <param name="request">The PropertiesDto containing property details.</param>
        /// <returns>A Task representing the asynchronous operation, returning a boolean indicating success or failure.</returns>
        /// <exception cref="ServiceException">Thrown when an error occurs while processing the property.</exception>

        public async Task<bool> AddPropertyAsync(PropertiesDto request)
        {
            try
            {
                // Initialize the property entity based on the received DTO
                var pro = new Properties
                {
                    OwnerID = request.OwnerID, // Assign the OwnerID from Identity
                    PropertyName = request.PropertyName,
                    PropertyPrice = request.PropertyPrice,
                    PropertyDescription = request.PropertyDescription,
                    PropertyLocation = request.PropertyLocation,
                    OwnerMobileNO = request.OwnerMobileNo,
                    PropertyType = request.PropertyType,
                    TransactionType = request.TransactionType
                };

                // Serialize specific property type details into 'SpecificDetails' field
                if (request.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                {
                    var land = new Lands_Plots
                    {
                        Type = request.L_Type,
                        PlotArea = request.PlotArea,
                        Length = request.Length,
                        Breadth = request.Breadth,
                        Facing = request.L_Facing
                    };
                    pro.SpecificDetails = JsonSerializer.Serialize(land);
                }
                else if (request.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                {
                    var flat = new Houses_Apartments
                    {
                        Type = request.H_Type,
                        BHK = request.BHK,
                        Bathrooms = request.Bathrooms,
                        Furnishing = request.H_Furnishing,
                        Project_Status = request.Project_Status,
                        Sqft = request.H_Sqft,
                        Maintenance = request.H_Maintenance,
                        Total_Floors = request.Total_Floors,
                        Floor_No = request.Floor_No,
                        Car_Parking = request.H_Car_Parking,
                        Facing = request.H_Facing
                    };
                    pro.SpecificDetails = JsonSerializer.Serialize(flat);
                }
                else if (request.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                {
                    var pg = new PG_GuestHouses
                    {
                        Type = request.P_Type,
                        Furnishing = request.P_Furnishing,
                        CarParking = request.P_CarParking,
                        NumFloors = request.NumFloors
                    };
                    pro.SpecificDetails = JsonSerializer.Serialize(pg);
                }
                else if (request.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                {
                    var shop = new Shops_Offices
                    {
                        Type = request.S_Type,
                        Furnishing = request.S_Furnishing,
                        Sqft = request.S_Sqft,
                        Car_Parking = request.S_Car_Parking,
                        Washrooms = request.Washrooms
                    };
                    pro.SpecificDetails = JsonSerializer.Serialize(shop);
                }

                // Handle property images (if provided)
                using (var memoryStream = new MemoryStream())
                {
                    if (request.PropertyImage != null && request.PropertyImage.Any())
                    {
                        foreach (var file in request.PropertyImage)
                        {
                            if (file.Length > 0)
                            {
                                await file.CopyToAsync(memoryStream);

                                byte[] delimiter = new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 }; // JPEG image delimiter
                                memoryStream.Write(delimiter, 0, delimiter.Length);
                            }
                        }

                        // Store the image list (assuming your model stores images as byte arrays)
                        pro.PropertyImage = memoryStream.ToArray();
                    }
                }

                // Call the repository to add the property to the database
                return await _ownerRepository.AddPropertyAsync(pro);
            }
            catch (Exception ex)
            {
                // Catch any exceptions that occur during the property processing and throw them
                throw new ServiceException("An error occurred while adding the property.", ex);
            }
        }


        /// <summary>
        /// Asynchronously updates a property in the system.
        /// This method fetches the existing property, updates its details, 
        /// processes specific property type data and images, and invokes 
        /// the repository to save the changes in the database.
        /// </summary>
        /// <param name="id">The ID of the property to update.</param>
        /// <param name="request">The PropertiesDto containing updated property details.</param>
        /// <returns>A Task representing the asynchronous operation, returning a boolean indicating success or failure.</returns>
        /// <exception cref="ServiceException">Thrown when an error occurs while updating the property.</exception>

        public async Task<bool> UpdatePropertyAsync(int id, PropertiesDto request)
        {
            try
            {
                // Fetch the existing property
                var existingProperty = await _ownerRepository.GetPropertyByIdAsync(id);
                if (existingProperty == null)
                {
                    return false; // Property not found
                }

                // Update basic property details
                if (!string.IsNullOrEmpty(request.PropertyName))
                    existingProperty.PropertyName = request.PropertyName;
                if (!string.IsNullOrEmpty(request.PropertyPrice))
                    existingProperty.PropertyPrice = request.PropertyPrice;
                if (!string.IsNullOrEmpty(request.TransactionType))
                    existingProperty.TransactionType = request.TransactionType;
                if (!string.IsNullOrEmpty(request.PropertyDescription))
                    existingProperty.PropertyDescription = request.PropertyDescription;
                if (!string.IsNullOrEmpty(request.PropertyLocation))
                    existingProperty.PropertyLocation = request.PropertyLocation;
                if (!string.IsNullOrEmpty(request.OwnerMobileNo))
                    existingProperty.OwnerMobileNO = request.OwnerMobileNo;

                // Update specific property type details (e.g., Lands_Plots, Houses_Apartments, etc.)
                if (existingProperty.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
                {
                    var land = JsonSerializer.Deserialize<Lands_Plots>(existingProperty.SpecificDetails);
                    if (!string.IsNullOrEmpty(request.L_Type))
                        land.Type = request.L_Type;
                    if (!string.IsNullOrEmpty(request.PlotArea))
                        land.PlotArea = request.PlotArea;
                    if (!string.IsNullOrEmpty(request.Length))
                        land.Length = request.Length;
                    if (!string.IsNullOrEmpty(request.Breadth))
                        land.Breadth = request.Breadth;
                    if (!string.IsNullOrEmpty(request.L_Facing))
                        land.Facing = request.L_Facing;
                    existingProperty.SpecificDetails = JsonSerializer.Serialize(land);
                }
                else if (existingProperty.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
                {
                    var flat = JsonSerializer.Deserialize<Houses_Apartments>(existingProperty.SpecificDetails);
                    if (!string.IsNullOrEmpty(request.H_Type))
                        flat.Type = request.H_Type;
                    if (!string.IsNullOrEmpty(request.BHK))
                        flat.BHK = request.BHK;
                    if (!string.IsNullOrEmpty(request.Bathrooms))
                        flat.Bathrooms = request.Bathrooms;
                    if (!string.IsNullOrEmpty(request.H_Furnishing))
                        flat.Furnishing = request.H_Furnishing;
                    if (!string.IsNullOrEmpty(request.Project_Status))
                        flat.Project_Status = request.Project_Status;
                    if (!string.IsNullOrEmpty(request.H_Sqft))
                        flat.Sqft = request.H_Sqft;
                    if (request.H_Maintenance.HasValue)
                        flat.Maintenance = request.H_Maintenance.Value;
                    if (!string.IsNullOrEmpty(request.Total_Floors))
                        flat.Total_Floors = request.Total_Floors;
                    if (!string.IsNullOrEmpty(request.Floor_No))
                        flat.Floor_No = request.Floor_No;
                    if (!string.IsNullOrEmpty(request.H_Car_Parking))
                        flat.Car_Parking = request.H_Car_Parking;
                    if (!string.IsNullOrEmpty(request.H_Facing))
                        flat.Facing = request.H_Facing;
                    existingProperty.SpecificDetails = JsonSerializer.Serialize(flat);
                }
                else if (existingProperty.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
                {
                    var pg = JsonSerializer.Deserialize<PG_GuestHouses>(existingProperty.SpecificDetails);
                    if (!string.IsNullOrEmpty(request.P_Type))
                        pg.Type = request.P_Type;
                    if (!string.IsNullOrEmpty(request.P_Furnishing))
                        pg.Furnishing = request.P_Furnishing;
                    if (!string.IsNullOrEmpty(request.P_CarParking))
                        pg.CarParking = request.P_CarParking;
                    if (!string.IsNullOrEmpty(request.NumFloors))
                        pg.NumFloors = request.NumFloors;
                    existingProperty.SpecificDetails = JsonSerializer.Serialize(pg);
                }
                else if (existingProperty.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
                {
                    var shop = JsonSerializer.Deserialize<Shops_Offices>(existingProperty.SpecificDetails);
                    if (!string.IsNullOrEmpty(request.S_Type))
                        shop.Type = request.S_Type;
                    if (!string.IsNullOrEmpty(request.S_Furnishing))
                        shop.Furnishing = request.S_Furnishing;
                    if (!string.IsNullOrEmpty(request.S_Sqft))
                        shop.Sqft = request.S_Sqft;
                    if (!string.IsNullOrEmpty(request.S_Car_Parking))
                        shop.Car_Parking = request.S_Car_Parking;
                    if (!string.IsNullOrEmpty(request.Washrooms))
                        shop.Washrooms = request.Washrooms;
                    existingProperty.SpecificDetails = JsonSerializer.Serialize(shop);
                }




                // Handle property images if provided
                if (request.PropertyImage != null && request.PropertyImage.Any())
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        foreach (var file in request.PropertyImage)
                        {
                            if (file.Length > 0)
                            {
                                await file.CopyToAsync(memoryStream);
                            }
                        }
                        existingProperty.PropertyImage = memoryStream.ToArray();
                    }
                }

                // Call repository to save updated property to the database
                return await _ownerRepository.UpdatePropertyAsync(existingProperty);
            }
            catch (Exception ex)
            {
                // Log the exception and rethrow as ServiceException
                throw new ServiceException("An error occurred while updating the property.", ex);
            }
        }


        /// <summary>
        /// Asynchronously deletes a property from the system based on its ID.
        /// Validates the input, checks for the existence of the property, 
        /// and invokes the repository to delete the property from the database.
        /// </summary>
        /// <param name="propertyId">The ID of the property to be deleted.</param>
        /// <returns>A Task representing the asynchronous operation, returning a boolean indicating whether the deletion was successful.</returns>
        /// <exception cref="ArgumentException">Thrown if the provided property ID is invalid.</exception>
        /// <exception cref="KeyNotFoundException">Thrown if the property with the specified ID is not found.</exception>

        public async Task<bool> DeletePropertyAsync(int propertyId)
        {
            // Validate input
            if (propertyId <= 0)
            {
                throw new ArgumentException("Invalid property ID.");
            }

            // Find the property
            var property = await _ownerRepository.GetPropertyByIdAsync(propertyId);

            if (property == null)
            {
                throw new KeyNotFoundException("Property not found.");
            }

            // Delete the property
            return await _ownerRepository.DeletePropertyAsync(property);
        }

        /// <summary>
        /// Retrieves a list of properties owned by a specific owner based on their owner ID.
        /// Validates the input, fetches properties from the repository, and maps them to DTOs.
        /// </summary>
        /// <param name="ownerId">The unique identifier of the owner.</param>
        /// <returns>
        /// A list of <see cref="PropertiesGetDto"/> representing the properties owned by the specified owner.
        /// </returns>
        /// <exception cref="ArgumentException">Thrown if the provided owner ID is null or empty.</exception>
        /// <exception cref="KeyNotFoundException">Thrown if no properties are found for the specified owner.</exception>

        public async Task<List<PropertiesGetDto>> GetPropertiesByOwnerAsync(string ownerId)
        {
            if (string.IsNullOrEmpty(ownerId))
            {
                throw new ArgumentException("Owner ID is required.");
            }

            // Fetch properties from the repository
            var properties = await _ownerRepository.GetPropertiesByOwnerAsync(ownerId);

            if (properties == null || !properties.Any())
            {
                throw new KeyNotFoundException("No properties found for the given owner.");
            }

            // Map the properties to DTOs
            return properties.Select(property =>
            {
                // Extract images
                var images = SplitImagesByDelimiter(property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });
                var firstImageBase64 = images.FirstOrDefault() != null ? Convert.ToBase64String(images.First()) : null;

                // Initialize variables
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
                    Type = type, // Include resolved Type
                    Sqft = sqft, // Include resolved Sqft
                    PropertyImage = firstImageBase64
                };
            }).ToList();
        }

        /// <summary>
        /// Retrieves the details of a property based on its ID and also fetches related images.
        /// Validates the property ID, fetches property and owner details, and returns the response with mapped data.
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property.</param>
        /// <returns>
        /// A tuple containing:
        /// - A <see cref="PropertiesIdGetDto"/> with the mapped property and owner details.
        /// - A list of base64-encoded property images.
        /// </returns>
        /// <exception cref="ArgumentException">Thrown if the provided property ID is invalid (less than or equal to 0).</exception>
        /// <exception cref="KeyNotFoundException">Thrown if the property with the provided ID is not found.</exception>

        public async Task<(PropertiesIdGetDto, List<string>)> GetPropertyByIdAsync(int propertyId)
        {
            if (propertyId <= 0)
            {
                throw new ArgumentException("Invalid Property ID.");
            }

            // Fetch property details
            var property = await _ownerRepository.GetPropertyByIdAsync(propertyId);
            if (property == null)
            {
                throw new KeyNotFoundException("Property not found.");
            }

            // Fetch owner details
            var ownerDetails = await _ownerRepository.GetOwnerDetailsByIdAsync(property.OwnerID);

            // Map property and owner details to DTO
            var response = new PropertiesIdGetDto
            {
                PropertyName = property.PropertyName,
                OwnerID = property.OwnerID,
                PropertyLocation = property.PropertyLocation,
                PropertyType = property.PropertyType,
                OwnerMobileNo = property.OwnerMobileNO,
                PropertyPrice = property.PropertyPrice,
                PropertyDescription = property.PropertyDescription,
                propertyFor = property.TransactionType,
                Sellaremail = ownerDetails.Email,
                Sellarfirstname = ownerDetails.FirstName,
                Sellarlastname = ownerDetails.LastName,
                Sellaraddress = ownerDetails.Address,
                Sellaravtar = ownerDetails.Avatar != null ? Convert.ToBase64String(ownerDetails.Avatar) : null
            };

            // Deserialize SpecificDetails based on PropertyType
            DeserializeSpecificDetails(property, response);

            // Split and convert property images to Base64
            var images = SplitImagesByDelimiter(property.PropertyImage, new byte[] { 0xFF, 0xD9, 0xFF, 0xD8 });
            var imageList = images.Select(image => Convert.ToBase64String(image)).ToList();

            return (response, imageList);
        }


        /// <summary>
        /// Splits the image data into multiple images based on the provided delimiter. 
        /// The method searches for the delimiter in the image data and splits the byte array at each occurrence of the delimiter.
        /// </summary>
        /// <param name="imageData">The byte array representing the image data to be split.</param>
        /// <param name="delimiter">The byte array delimiter used to split the image data.</param>
        /// <returns>A list of byte arrays where each byte array represents a single image.</returns>

        private void DeserializeSpecificDetails(Properties property, PropertiesIdGetDto response)
        {
            if (property.PropertyType.Equals("Lands_Plots", StringComparison.OrdinalIgnoreCase))
            {
                var land = JsonSerializer.Deserialize<Lands_Plots>(property.SpecificDetails);
                if (land != null)
                {
                    response.L_Type = land.Type;
                    response.PlotArea = land.PlotArea;
                    response.Length = land.Length;
                    response.Breadth = land.Breadth;
                    response.L_Facing = land.Facing;
                }
            }
            else if (property.PropertyType.Equals("Houses_Apartments", StringComparison.OrdinalIgnoreCase))
            {
                var house = JsonSerializer.Deserialize<Houses_Apartments>(property.SpecificDetails);
                if (house != null)
                {
                    response.H_Type = house.Type;
                    response.BHK = house.BHK;
                    response.Bathrooms = house.Bathrooms;
                    response.H_Furnishing = house.Furnishing;
                    response.Project_Status = house.Project_Status;
                    response.H_Sqft = house.Sqft;
                    response.H_Maintenance = house.Maintenance;
                    response.Total_Floors = house.Total_Floors;
                    response.Floor_No = house.Floor_No;
                    response.H_Car_Parking = house.Car_Parking;
                    response.H_Facing = house.Facing;
                }
            }
            else if (property.PropertyType.Equals("PG_GuestHouses", StringComparison.OrdinalIgnoreCase))
            {
                var pg = JsonSerializer.Deserialize<PG_GuestHouses>(property.SpecificDetails);
                if (pg != null)
                {
                    response.P_Type = pg.Type;
                    response.P_Furnishing = pg.Furnishing;
                    response.P_CarParking = pg.CarParking;
                    response.NumFloors = pg.NumFloors;
                }
            }
            else if (property.PropertyType.Equals("Shops_Offices", StringComparison.OrdinalIgnoreCase))
            {
                var shop = JsonSerializer.Deserialize<Shops_Offices>(property.SpecificDetails);
                if (shop != null)
                {
                    response.S_Type = shop.Type;
                    response.S_Furnishing = shop.Furnishing;
                    response.S_Sqft = shop.Sqft;
                    response.S_Car_Parking = shop.Car_Parking;
                    response.Washrooms = shop.Washrooms;
                }
            }
        }


        /// <summary>
        /// Splits a byte array of image data into multiple images based on a specified delimiter.
        /// The method iterates through the provided image data, finding instances of the delimiter 
        /// and splitting the data into separate byte arrays, each representing an individual image.
        /// </summary>
        /// <param name="imageData">The byte array containing the combined image data to be split.</param>
        /// <param name="delimiter">The byte array delimiter that separates individual images within the image data.</param>
        /// <returns>A list of byte arrays, each representing a separate image.</returns>

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
        /// Searches for the first occurrence of a specified delimiter within a byte array starting from a given position.
        /// The method iterates through the byte array from the specified start index and checks for a sequence 
        /// that matches the delimiter. It returns the index of the first occurrence of the delimiter or -1 if not found.
        /// </summary>
        /// <param name="data">The byte array in which to search for the delimiter.</param>
        /// <param name="delimiter">The byte array representing the delimiter to find.</param>
        /// <param name="start">The index to start the search from within the data array.</param>
        /// <returns>The index of the first occurrence of the delimiter in the data array, or -1 if the delimiter is not found.</returns>

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

        /// <summary>
        /// Asynchronously updates the status of a property in the system.
        /// The method retrieves the existing property status and updates it based on the provided status type.
        /// If the status type is "Sold", it updates all properties with the same PropertyID to "SoldOut".
        /// </summary>
        /// <param name="request">The request containing the property ID, owner ID, user ID, and the status type to update.</param>
        /// <returns>A Task representing the asynchronous operation, with a boolean value indicating whether the status update was successful.</returns>
        /// <exception cref="ArgumentException">Thrown if the provided property ID, owner ID, or user ID are invalid.</exception>

        public async Task<bool> UpdatePropertyStatusAsync(PropStatusPostDto request)
        {
            bool status = false;
            // Retrieve the existing status
            var existingStatus = await _ownerRepository.GetPropertyStatusAsync(request.PropertyID, request.OwnerID, request.UserId);

            // If the status doesn't exist, return false
            if (existingStatus == null)
            {
                return false; // Property status not found
            }

            // Update the status if provided
            if (!string.IsNullOrEmpty(request.StatusType))
            {
                existingStatus.StatusType = request.StatusType;
                status = await _ownerRepository.UpdatePropertyStatusAsync(existingStatus);
            }

            // If the StatusType is "Sold", update all properties with the same PropertyID to "SoldOut"
            if (request.StatusType?.Equals("Sold", StringComparison.OrdinalIgnoreCase) == true)
            {
                // Retrieve all properties with the same PropertyID
                var allProperties = await _ownerRepository.GetPropertiesByPropertyIDAsync(request.PropertyID);

                // Update the status of all properties to "SoldOut"
                foreach (var property in allProperties)
                {
                    property.StatusType = "SoldOut";
                }

                // Persist the changes for all properties
                status = await _ownerRepository.UpdateMultiplePropertiesAsync(allProperties);
            }

            // Persist the changes to the repository
            return status;
        }

        /// <summary>
        /// Asynchronously retrieves property status requests for a given owner.
        /// The method fetches property status records for the specified owner, then retrieves user details and 
        /// maps the property statuses to DTOs for easy consumption by the client.
        /// </summary>
        /// <param name="ownerId">The unique identifier of the property owner for whom the requests are to be fetched.</param>
        /// <returns>A Task representing the asynchronous operation, with a list of DTOs containing property status details for the customer requests.</returns>
        /// <exception cref="ArgumentException">Thrown when the provided owner ID is invalid or null.</exception>

        public async Task<List<PropStatusDto>> GetCustomerRequestsByOwnerAsync(string ownerId)
        {
            // Fetch property statuses for the given owner from the repository
            var propStatuses = await _ownerRepository.GetCustomerRequestsByOwnerAsync(ownerId);

            // Create a list of DTOs
            var propStatusDtos = new List<PropStatusDto>();

            foreach (var ps in propStatuses)
            {
                // Fetch user details for the customer
                var user = await _ownerRepository.GetUserDetailsByIdAsync(ps.UserId);

                // Map the property status to a DTO
                var propStatusDto = new PropStatusDto
                {
                    UserId = ps.UserId,
                    CustomerName = user.FirstName != null && user.LastName != null ? $"{user.FirstName} {user.LastName}" : $"{user.UserName}",
                    PropertyID = ps.PropertyID,
                    OwnerID = ps.OwnerID,
                    StatusType = ps.StatusType,
                    PropertyDetails = ps.Property == null ? null : new PropertiesGetViewDto
                    {
                        PropertyName = ps.Property.PropertyName,
                        PropertyPrice = ps.Property.PropertyPrice,
                        PropertyDescription = ps.Property.PropertyDescription,
                        PropertyLocation = ps.Property.PropertyLocation,
                        PropertyType = JsonSerializer.Deserialize<PG_GuestHouses>(ps.Property.SpecificDetails).Type,
                        OwnerMobileNo = ps.Property.OwnerMobileNO,
                    }
                };

                // Add to the DTO list
                propStatusDtos.Add(propStatusDto);
            }

            // Return the list of DTOs
            return propStatusDtos;
        }


    }
}