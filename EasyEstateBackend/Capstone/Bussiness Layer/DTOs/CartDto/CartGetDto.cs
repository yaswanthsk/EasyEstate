using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Bussiness_Layer.DTOs.PropertyDto;

namespace Bussiness_Layer.DTOs.CartDto
{
    public class CartGetDto
    {
        [Key]
        public int CartID { get; set; }

        [Required(ErrorMessage = "PropertyID is required.")]
        [ForeignKey("Properties")]
        [Range(1, int.MaxValue, ErrorMessage = "PropertyID must be a positive integer.")]
        public int PropertyID { get; set; }

        public PropertiesGetCartDto? PropertyDetails { get; set; }


    }
}
