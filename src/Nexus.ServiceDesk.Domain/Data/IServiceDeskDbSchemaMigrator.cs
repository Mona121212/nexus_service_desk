using System.Threading.Tasks;

namespace Nexus.ServiceDesk.Data;

public interface IServiceDeskDbSchemaMigrator
{
    Task MigrateAsync();
}
