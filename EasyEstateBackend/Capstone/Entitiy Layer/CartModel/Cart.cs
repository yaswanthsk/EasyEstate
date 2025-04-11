using Entitiy_Layer.AccountModel;
using Entitiy_Layer.PropertyModel;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entitiy_Layer.CartModel
{
    public class Cart
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CartID { get; set; }

        [ForeignKey("Properties")]
        public int PropertyID { get; set; }

        [ForeignKey("ApplicationUser")]
        public string? UserID { get; set; }

        public virtual Properties? Property { get; set; } // Navigation property
        public ApplicationUser ApplicationUser { get; set; }
    }
}
