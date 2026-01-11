using Nexus.ServiceDesk.Localization;
using Volo.Abp.Application.Services;

namespace Nexus.ServiceDesk;

/* Inherit your application services from this class.
 */
public abstract class ServiceDeskAppService : ApplicationService
{
    protected ServiceDeskAppService()
    {
        LocalizationResource = typeof(ServiceDeskResource);
    }
}
