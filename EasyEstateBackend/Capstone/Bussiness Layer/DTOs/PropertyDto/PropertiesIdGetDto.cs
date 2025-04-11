using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.PropertyDto
{
    public class PropertiesIdGetDto
    {
        public string? OwnerID { get; set; }
        public string? PropertyName { get; set; }
        public string? PropertyType {  get; set; }
        public string? PropertyPrice { get; set; }
        public string? PropertyDescription { get; set; }
        public string? PropertyLocation { get; set; }
        public string? OwnerMobileNo { get; set; }
        public string? propertyFor { get; set; }
        public string? Sellaremail { get; set; }
        public string? Sellarfirstname { get; set; }
        public string? Sellarlastname { get; set; }
        public string? Sellaravtar { get; set; }

        public string? Sellaraddress { get; set; }


        //DTO for Houses_Apartments
        public string? H_Type { get; set; }
        public string? BHK { get; set; }
        public string? Bathrooms { get; set; }
        public string? H_Furnishing { get; set; }
        public string? Project_Status { get; set; }
        public string? H_Sqft { get; set; }
        public decimal? H_Maintenance { get; set; }
        public string? Total_Floors { get; set; }
        public string? Floor_No { get; set; }
        public string? H_Car_Parking { get; set; }
        public string? H_Facing { get; set; }

        //DTO for Lands_Plots

        public string? L_Type { get; set; }
        public string? PlotArea { get; set; }
        public string? Length { get; set; }
        public string? Breadth { get; set; }
        public string? L_Facing { get; set; }

        //DTO for Shops_Offices
        public string? S_Type { get; set; }
        public string? S_Furnishing { get; set; }
        public string? S_Sqft { get; set; }
        public string? S_Car_Parking { get; set; }
        public string? Washrooms { get; set; }

        //DTO for PG_GuestHouses
        public string? P_Type { get; set; }
        public string? P_Furnishing { get; set; }
        public string? P_CarParking { get; set; }
        public string? NumFloors { get; set; }
    }
}
