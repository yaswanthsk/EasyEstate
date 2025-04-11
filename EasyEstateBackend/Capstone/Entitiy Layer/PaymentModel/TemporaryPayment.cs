using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entitiy_Layer.PaymentModel
{
    public class TemporaryPayment
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public decimal Amount { get; set; }
        public string Plan { get; set; }
        public string OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
