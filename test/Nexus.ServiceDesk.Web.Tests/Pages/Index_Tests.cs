using System.Threading.Tasks;
using Shouldly;
using Xunit;

namespace Nexus.ServiceDesk.Pages;

[Collection(ServiceDeskTestConsts.CollectionDefinitionName)]
public class Index_Tests : ServiceDeskWebTestBase
{
    [Fact]
    public async Task Welcome_Page()
    {
        var response = await GetResponseAsStringAsync("/");
        response.ShouldNotBeNull();
    }
}
