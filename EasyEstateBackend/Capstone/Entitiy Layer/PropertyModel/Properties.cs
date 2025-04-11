using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.AccountModel;


namespace Entitiy_Layer.PropertyModel
{
    public class Properties
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PropertyID { get; set; }

        [ForeignKey("ApplicationUser")]

        public string? OwnerID { get; set; }

        public string? PropertyName { get; set; }

        public string? PropertyPrice { get; set; }

        public string? PropertyDescription { get; set; }

        public string? PropertyLocation { get; set; }

        public string? OwnerMobileNO { get; set; }

        public byte[]? PropertyImage { get; set; }

        [Required(ErrorMessage = "Transaction Type is required.")]
        public string? TransactionType { get; set; }
        public string? PropertyType { get; set; }

        public string? SpecificDetails { get; set; }

        public ApplicationUser ApplicationUser { get; set; }

        [NotMapped]
        public Houses_Apartments Houses_Apartments { get; set; }
        [NotMapped]

        public Lands_Plots Lands_Plots { get; set; }
        [NotMapped]

        public Shops_Offices Shops_Offices { get; set; }
        [NotMapped]
        public PG_GuestHouses PG_GuestHouses { get; set; }

    }
}
