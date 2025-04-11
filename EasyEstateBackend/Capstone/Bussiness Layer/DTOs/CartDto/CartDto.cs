using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Bussiness_Layer.DTOs.CartDto
{
    public class CartDto
    {

        [Key]
        public int CartID { get; set; }

        [Required(ErrorMessage = "PropertyID is required.")]
        [ForeignKey("Properties")]
        [Range(1, int.MaxValue, ErrorMessage = "PropertyID must be a positive integer.")]
        public int PropertyID { get; set; }

        [Required(ErrorMessage = "UserID is required.")]
        [StringLength(50, ErrorMessage = "UserID cannot exceed 50 characters.")]
        public string? UserID { get; set; }
    }
}
