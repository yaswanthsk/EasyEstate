using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.PropertyDto
{
    public class PropertiesGetDto
    {
        public int PropertyID { get; set; }
        public string? OwnerID { get; set; }
        public string? PropertyFor { get; set; }
        public string? PropertyName { get; set; }
        public string? PropertyPrice { get; set; }
        public string? PropertyDescription { get; set; }
        public string? PropertyLocation { get; set; }
        public string? OwnerMobileNo { get; set; }
        public string? PropertyType { get; set; }
        public string? PropertyImage { get; set; }
        public string? Type { get; set; }
        public string? Sqft { get; set; }

    }
}
