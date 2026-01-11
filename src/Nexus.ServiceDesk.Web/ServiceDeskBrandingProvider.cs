using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.Localization;
using Nexus.ServiceDesk.Localization;

namespace Nexus.ServiceDesk.Web;

[Dependency(ReplaceServices = true)]
public class ServiceDeskBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<ServiceDeskResource> _localizer;

    public ServiceDeskBrandingProvider(IStringLocalizer<ServiceDeskResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
