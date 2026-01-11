using Volo.Abp.Settings;

namespace Nexus.ServiceDesk.Settings;

public class ServiceDeskSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(ServiceDeskSettings.MySetting1));
    }
}
