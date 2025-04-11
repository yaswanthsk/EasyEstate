using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Entitiy_Layer.PropertyModel;

namespace Entitiy_Layer.StatusModel
{
    public class PropStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StatusId { get; set; }

        [ForeignKey("Applicationuser")]
        public string? UserId { get; set; }

        [ForeignKey("Properties")]
        public int PropertyID { get; set; }
        public string? OwnerID { get; set; }
        public string? StatusType { get; set; }
        public virtual Properties? Property { get; set; }

    }
}
