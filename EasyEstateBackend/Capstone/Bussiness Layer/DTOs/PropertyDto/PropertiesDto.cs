using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.PropertyDto
{
    public class PropertiesDto
    {
        public string? OwnerID { get; set; }

        [StringLength(100, ErrorMessage = "Property Name cannot exceed 100 characters.")]
        public string? PropertyName { get; set; }

        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Property Price format.")]
        public string? PropertyPrice { get; set; }

        [StringLength(500, ErrorMessage = "Property Description cannot exceed 500 characters.")]
        public string? PropertyDescription { get; set; }

        public string? PropertyLocation { get; set; }

        [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile Number must be a 10-digit number.")]
        public string? OwnerMobileNo { get; set; }

        public List<IFormFile>? PropertyImage { get; set; }

        public string? PropertyType { get; set; }

        public string? TransactionType { get; set; }

        //DTO for Houses_Apartments
        [StringLength(50, ErrorMessage = "House Type cannot exceed 50 characters.")]
        public string? H_Type { get; set; }

        [StringLength(10, ErrorMessage = "BHK cannot exceed 10 characters.")]
        public string? BHK { get; set; }

        [StringLength(10, ErrorMessage = "Bathrooms information cannot exceed 10 characters.")]
        public string? Bathrooms { get; set; }

        [StringLength(50, ErrorMessage = "Furnishing info cannot exceed 50 characters.")]
        public string? H_Furnishing { get; set; }

        [StringLength(50, ErrorMessage = "Project Status cannot exceed 50 characters.")]
        public string? Project_Status { get; set; }

        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Square Feet format.")]
        public string? H_Sqft { get; set; }

        public decimal? H_Maintenance { get; set; }

        [StringLength(10, ErrorMessage = "Total Floors information cannot exceed 10 characters.")]
        public string? Total_Floors { get; set; }

        [StringLength(10, ErrorMessage = "Floor Number cannot exceed 10 characters.")]
        public string? Floor_No { get; set; }

        [StringLength(10, ErrorMessage = "Car Parking information cannot exceed 10 characters.")]
        public string? H_Car_Parking { get; set; }

        [StringLength(50, ErrorMessage = "Facing information cannot exceed 50 characters.")]
        public string? H_Facing { get; set; }

        //DTO for Lands_Plots
        [StringLength(50, ErrorMessage = "Land Type cannot exceed 50 characters.")]
        public string? L_Type { get; set; }

        //[RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Plot Area format.")]
        public string? PlotArea { get; set; }

        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Length format.")]
        public string? Length { get; set; }

        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Breadth format.")]
        public string? Breadth { get; set; }

        [StringLength(50, ErrorMessage = "Land Facing cannot exceed 50 characters.")]
        public string? L_Facing { get; set; }

        //DTO for Shops_Offices
        [StringLength(50, ErrorMessage = "Shop Type cannot exceed 50 characters.")]
        public string? S_Type { get; set; }

        [StringLength(50, ErrorMessage = "Shop Furnishing cannot exceed 50 characters.")]
        public string? S_Furnishing { get; set; }

        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Invalid Square Feet format.")]
        public string? S_Sqft { get; set; }

        [StringLength(10, ErrorMessage = "Car Parking information cannot exceed 10 characters.")]
        public string? S_Car_Parking { get; set; }

        [StringLength(10, ErrorMessage = "Washrooms information cannot exceed 10 characters.")]
        public string? Washrooms { get; set; }

        //DTO for PG_GuestHouses
        [StringLength(50, ErrorMessage = "PG Type cannot exceed 50 characters.")]
        public string? P_Type { get; set; }

        [StringLength(50, ErrorMessage = "Furnishing information cannot exceed 50 characters.")]
        public string? P_Furnishing { get; set; }

        [StringLength(10, ErrorMessage = "Car Parking information cannot exceed 10 characters.")]
        public string? P_CarParking { get; set; }

        [StringLength(10, ErrorMessage = "Number of Floors cannot exceed 10 characters.")]
        public string? NumFloors { get; set; }
    }
}
