using Data_Access_Layer.Data;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Bussiness_Layer.DTOs.PropertyDto;
using Bussiness_Layer.Interfaces;
using Bussiness_Layer.DTOs.StatusDto;
using Microsoft.AspNetCore.Authorization;
using ExceptionLayer.Exceptions;

namespace EasyEstate.Controllers
{
    /// <summary>
    /// Controller to manage property-related operations for owners, including adding, updating, deleting, and retrieving properties.
    /// Also handles requests related to property status and customer requests.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly AuthDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IOwnerService _ownerService;

        public OwnerController(AuthDbContext dbContext, UserManager<ApplicationUser> userManager, IOwnerService ownerService)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _ownerService = ownerService;


        }

        /// <summary>
        /// Allows an owner to list a property for sale.
        /// The method takes property details as input and attempts to add the property to the system.
        /// It validates the request and calls the service to persist the property in the database.
        /// </summary>
        /// <param name="request">The details of the property to be listed for sale.</param>
        /// <returns>An IActionResult indicating the success or failure of the property addition.</returns>

        [HttpPost("SellProperty")]
        public async Task<IActionResult> SellProperty(PropertiesDto request)
        {
            try
            {
                // Validate the request model
                if (request == null || !ModelState.IsValid)
                {
                    return BadRequest(new { Status = "Error", Message = "Property details are required." });
                }

                // Call the service to add the property
                var result = await _ownerService.AddPropertyAsync(request);

                // Handle the result from the service layer
                if (!result)
                {
                    return BadRequest(new { Status = "Error", Message = "Failed to add property." });
                }

                return Ok(new { Status = "Success", Message = "Your property is kept for sale successfully." });
            }
            catch (ServiceException ex)
            {
                // Handle known service exceptions
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }



        /// <summary>
        /// Updates the details of an existing property.
        /// The method takes the property ID and the updated property details as input and updates the property in the database.
        /// It calls the service to perform the update operation and returns a success or failure response.
        /// </summary>
        /// <param name="id">The ID of the property to be updated.</param>
        /// <param name="request">The updated property details.</param>
        /// <returns>An IActionResult indicating the success or failure of the update operation.</returns>
        [HttpPut("UpdateProperty/{id}")]
        public async Task<IActionResult> UpdateProperty(int id, [FromForm] PropertiesDto request)
        {
            try
            {
                // Validate the request
                if (request == null)
                {
                    return BadRequest(new { Status = "Error", Message = "Property details are required." });
                }

                // Call the service layer to update the property
                var result = await _ownerService.UpdatePropertyAsync(id, request);

                // If the result is false, it means the property was not found
                if (!result)
                {
                    return NotFound(new { Status = "Error", Message = "Property not found or could not be updated." });
                }

                return Ok(new { Status = "Success", Message = "Property updated successfully." });
            }
            catch (ServiceException ex)
            {
                // Handle known service exceptions
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }




        /// <summary>
        /// Deletes a property based on the provided property ID.
        /// The method attempts to remove the property from the system by calling the service layer.
        /// If successful, it returns a success message, otherwise an error message is returned if the property is not found.
        /// </summary>
        /// <param name="propertyId">The ID of the property to be deleted.</param>
        /// <returns>An IActionResult indicating the success or failure of the delete operation.</returns>
        [HttpDelete("DeleteProperty/{propertyId}")]
        public async Task<IActionResult> DeleteProperty(int propertyId)
        {
            try
            {
                // Call the service to delete the property
                bool isDeleted = await _ownerService.DeletePropertyAsync(propertyId);

                if (!isDeleted)
                {
                    return NotFound(new { Status = "Error", Message = "Property not found or could not be deleted." });
                }

                return Ok(new { Status = "Success", Message = "Property deleted successfully." });
            }
            catch (ArgumentException ex)
            {
                // Handle invalid input
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                // Handle case when property is not found
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }



        /// <summary>
        /// Retrieves all properties listed by a specific owner.
        /// The method takes the owner ID as input and fetches all the properties associated with that owner.
        /// It calls the service to get the property data and returns the list of properties.
        /// </summary>
        /// <param name="ownerId">The ID of the owner whose properties need to be fetched.</param>
        /// <returns>An IActionResult containing the properties associated with the specified owner.</returns>

        [HttpGet("GetPropertiesByOwner/{ownerId}")]
        public async Task<IActionResult> GetPropertiesByOwner(string ownerId)
        {
            try
            {
                // Fetch properties using the service layer
                var propertyList = await _ownerService.GetPropertiesByOwnerAsync(ownerId);

                // Return the result
                return Ok(new { Status = "Success", Properties = propertyList });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }



        /// <summary>
        /// Retrieves the details of a specific property based on its ID.
        /// The method takes the property ID as input, calls the service to fetch the property and its associated images,
        /// and returns both the property details and images if found.
        /// </summary>
        /// <param name="propertyId">The ID of the property to retrieve.</param>
        /// <returns>An IActionResult containing the property details and associated images.</returns>

        [HttpGet("GetPropertyById/{propertyId}")]
        public async Task<IActionResult> GetPropertyById(int propertyId)
        {
            try
            {
                // Call service to fetch property and owner details
                var (propertyDetails, images) = await _ownerService.GetPropertyByIdAsync(propertyId);

                // Return successful response
                return Ok(new { Status = "Success", Property = propertyDetails, Images = images });
            }
            catch (ArgumentException ex)
            {
                // Handle invalid ID error
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                // Handle not found error
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle general errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }


        /// <summary>
        /// Updates the status of a property (e.g., availability or sale status).
        /// The method takes the property status details, including the owner ID and new status, 
        /// and calls the service layer to update the property's status in the database.
        /// </summary>
        /// <param name="propStatusPostDto">The status details, including the owner ID and new status to be applied to the property.</param>
        /// <returns>An IActionResult indicating the success or failure of the status update operation.</returns>

        [HttpPut("UpdatePropStatus")]
        public async Task<IActionResult> UpdatePropStatus([FromBody] PropStatusPostDto propStatusPostDto)
        {
            // Validate input
            if (propStatusPostDto == null || string.IsNullOrEmpty(propStatusPostDto.OwnerID))
            {
                return BadRequest(new { Status = "Error", Message = "Property status details are required." });
            }

            try
            {
                // Call service layer to update property status
                var result = await _ownerService.UpdatePropertyStatusAsync(propStatusPostDto);

                if (!result)
                {
                    return NotFound(new { Status = "Error", Message = "Property status not found." });
                }

                return Ok(new { Status = "Success", Message = "Property status updated successfully." });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves all customer requests for a specific property owner.
        /// The method takes the owner ID as input and calls the service to fetch all customer requests associated with that owner.
        /// If no requests are found, a not found message is returned.
        /// </summary>
        /// <param name="ownerId">The ID of the owner whose customer requests need to be fetched.</param>
        /// <returns>An IActionResult containing the list of customer requests or a message indicating no requests.</returns>
        [HttpGet("ViewCustomerRequests/{ownerId}")]
        public async Task<IActionResult> ViewCustomerRequests(string ownerId)
        {
            // Validate the ownerId
            if (string.IsNullOrEmpty(ownerId))
            {
                return BadRequest(new { Status = "Error", Message = "OwnerID is required." });
            }

            try
            {
                // Fetch customer requests from the service layer
                var requests = await _ownerService.GetCustomerRequestsByOwnerAsync(ownerId);

                if (requests == null || !requests.Any())
                {
                    return NotFound(new { Status = "Error", Message = "No requests came to you." });
                }

                return Ok(new { Status = "Success", Data = requests });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }


    }
}
