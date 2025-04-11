using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.AccountModel;
using Entitiy_Layer.PropertyModel;
using Entitiy_Layer.StatusModel;

namespace Data_Access_Layer.Interfaces
{
    public interface IOwnerRepository
    {
        Task<bool> AddPropertyAsync(Properties owner);
        Task<Properties> GetPropertyByIdAsync(int id);
        
        Task<ApplicationUser> GetUserDetailsByIdAsync(string id);
        Task<bool> UpdatePropertyAsync(Properties property);
        Task<bool> DeletePropertyAsync(Properties property);
        Task<List<Properties>> GetPropertiesByOwnerAsync(string ownerId);
        Task<ApplicationUser> GetOwnerDetailsByIdAsync(string ownerId);
        Task<PropStatus> GetPropertyStatusAsync(int propertyId, string ownerId, string userId);
        Task<bool> UpdatePropertyStatusAsync(PropStatus status);
        Task<List<PropStatus>> GetCustomerRequestsByOwnerAsync(string ownerId);

        //add
        Task<bool> UpdateMultiplePropertiesAsync(IEnumerable<PropStatus> properties);
        Task<IEnumerable<PropStatus>> GetPropertiesByPropertyIDAsync(int propertyID);


    }
}
