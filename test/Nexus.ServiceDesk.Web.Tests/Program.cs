using Microsoft.AspNetCore.Builder;
using Nexus.ServiceDesk;
using Volo.Abp.AspNetCore.TestBase;

var builder = WebApplication.CreateBuilder();
builder.Environment.ContentRootPath = GetWebProjectContentRootPathHelper.Get("Nexus.ServiceDesk.Web.csproj"); 
await builder.RunAbpModuleAsync<ServiceDeskWebTestModule>(applicationName: "Nexus.ServiceDesk.Web");

public partial class Program
{
}
