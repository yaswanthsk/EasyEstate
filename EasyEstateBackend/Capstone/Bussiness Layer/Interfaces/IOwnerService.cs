using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bussiness_Layer.DTOs.PropertyDto;
using Bussiness_Layer.DTOs.StatusDto;
using Entitiy_Layer.AccountModel;


namespace Bussiness_Layer.Interfaces
{
    public interface IOwnerService
    {
        Task<bool> AddPropertyAsync(PropertiesDto request);
        Task<bool> UpdatePropertyAsync(int id, PropertiesDto request);
        Task<bool> DeletePropertyAsync(int propertyId);
        Task<List<PropertiesGetDto>> GetPropertiesByOwnerAsync(string ownerId);
        Task<(PropertiesIdGetDto, List<string>)> GetPropertyByIdAsync(int propertyId);
        Task<bool> UpdatePropertyStatusAsync(PropStatusPostDto request);
        Task<List<PropStatusDto>> GetCustomerRequestsByOwnerAsync(string ownerId);

    }

}
