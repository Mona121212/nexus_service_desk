using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.AppMenus;

namespace Nexus.ServiceDesk.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class ServiceDeskDbContext :
    AbpDbContext<ServiceDeskDbContext>,
    ITenantManagementDbContext,
    IIdentityDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    public DbSet<RepairRequest> RepairRequests { get; set; } = null!;
    public DbSet<AppMenu> AppMenus { get; set; } = null!;
    public DbSet<AppRoleMenu> AppRoleMenus { get; set; } = null!;

    #region Entities from the modules

    /* Notice: We only implemented IIdentityProDbContext and ISaasDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityProDbContext and ISaasDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    // Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public ServiceDeskDbContext(DbContextOptions<ServiceDeskDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureTenantManagement();
        builder.ConfigureBlobStoring();

        /* Configure your own tables/entities inside here */

        // RepairRequest
        builder.Entity<RepairRequest>(b =>
        {
            b.ToTable("RepairRequests", ServiceDeskConsts.DbSchema, t =>
            {
                t.HasCheckConstraint("ck_rr_approval_status", "\"ApprovalStatus\" IN (0, 1, 2)");
                t.HasCheckConstraint("ck_rr_cancel_vs_approve", "NOT (\"IsCancelled\" = true AND \"ApprovalStatus\" = 1)");
                t.HasCheckConstraint("ck_rr_admin_required_when_decided",
                    "\"ApprovalStatus\" = 0 OR (\"AdminId\" IS NOT NULL AND \"ApprovedAt\" IS NOT NULL)");
            });
            b.ConfigureByConvention();

            b.Property(x => x.RequestNo).IsRequired().HasMaxLength(32);
            b.HasIndex(x => x.RequestNo).IsUnique();

            b.Property(x => x.TeacherId).IsRequired();
            b.Property(x => x.Title).IsRequired().HasMaxLength(200);
            b.Property(x => x.Description).IsRequired();
            b.Property(x => x.Building).IsRequired().HasMaxLength(100);
            b.Property(x => x.Room).IsRequired().HasMaxLength(50);

            b.Property(x => x.SubmittedAt).IsRequired();

            b.Property(x => x.IsCancelled).IsRequired().HasDefaultValue(false);
            b.Property(x => x.CancelledReason);

            b.Property(x => x.QuotedAmount).HasPrecision(12, 2);
            b.Property(x => x.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("CAD");

            b.Property(x => x.ApprovalStatus).HasDefaultValue(ApprovalStatus.Pending);

            // Indexes
            b.HasIndex(x => new { x.TeacherId, x.CreationTime }).HasDatabaseName("ix_rr_teacher_created_at");
            b.HasIndex(x => new { x.Building, x.Room }).HasDatabaseName("ix_rr_location");
            b.HasIndex(x => new { x.ApprovalStatus, x.CreationTime }).HasDatabaseName("ix_rr_approval_created_at");
            b.HasIndex(x => new { x.IsCancelled, x.CreationTime }).HasDatabaseName("ix_rr_cancelled_created_at");
            b.HasIndex(x => new { x.ElectricianId, x.CreationTime }).HasDatabaseName("ix_rr_electrician_created_at");
        });

        // AppMenu
        builder.Entity<AppMenu>(b =>
        {
            b.ToTable("AppMenus", ServiceDeskConsts.DbSchema);
            b.ConfigureByConvention();

            b.Property(x => x.Code).IsRequired().HasMaxLength(64);
            b.HasIndex(x => x.Code).IsUnique();

            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.Path).HasMaxLength(256);
            b.Property(x => x.Icon).HasMaxLength(64);
            b.Property(x => x.SortOrder).IsRequired().HasDefaultValue(0);
            b.Property(x => x.IsEnabled).IsRequired().HasDefaultValue(true);

            // Self-referencing relationship
            b.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            b.HasIndex(x => new { x.ParentId, x.SortOrder }).HasDatabaseName("ix_app_menus_parent_sort");
            b.HasIndex(x => x.IsEnabled).HasDatabaseName("ix_app_menus_enabled");
        });

        // AppRoleMenu
        builder.Entity<AppRoleMenu>(b =>
        {
            b.ToTable("AppRoleMenus", ServiceDeskConsts.DbSchema);
            b.HasKey(x => new { x.RoleId, x.MenuId });

            b.Property(x => x.RoleId).IsRequired();
            b.Property(x => x.MenuId).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            // Foreign keys
            b.HasOne(x => x.Menu)
                .WithMany()
                .HasForeignKey(x => x.MenuId)
                .OnDelete(DeleteBehavior.Cascade);

            // Note: RoleId references AbpRoles table, which is managed by ABP Identity module
            // We don't configure the foreign key here as it's handled by ABP

            // Indexes
            b.HasIndex(x => x.RoleId).HasDatabaseName("ix_arm_role");
            b.HasIndex(x => x.MenuId).HasDatabaseName("ix_arm_menu");
        });
    }
}
