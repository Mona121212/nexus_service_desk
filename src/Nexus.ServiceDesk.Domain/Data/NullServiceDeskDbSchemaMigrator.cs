using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace Nexus.ServiceDesk.Data;

/* This is used if database provider does't define
 * IServiceDeskDbSchemaMigrator implementation.
 */
public class NullServiceDeskDbSchemaMigrator : IServiceDeskDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
