from django.contrib import admin
from .models import Event, Registration, EmailLog, DistributionGroup
from .models import GroupAccessToken, GroupInvitation


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'date', 'location', 'max_qr_codes')
    search_fields = ('name', 'description')
    list_filter = ('date',)


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'user', 'entry_code', 'used')
    list_filter = ('event', 'used')
    search_fields = ('entry_code', 'user__username', 'user__email')


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient', 'subject', 'success', 'sent_at')
    list_filter = ('success', 'sent_at')
    search_fields = ('recipient', 'subject', 'error_text')


@admin.register(DistributionGroup)
class DistributionGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    filter_horizontal = ('members', 'events', 'admins', 'creators')
    search_fields = ('name',)


@admin.register(GroupAccessToken)
class GroupAccessTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'token', 'created_at', 'active')
    list_filter = ('active', 'created_at')
    search_fields = ('token', 'group__name')
    readonly_fields = ('token', 'created_at')


@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'created_by', 'created_at', 'expires_at', 'max_uses', 'use_count', 'active', 'is_valid')
    list_filter = ('active', 'created_at', 'expires_at')
    search_fields = ('token', 'group__name', 'created_by__username')
    readonly_fields = ('token', 'created_at')
    
    def is_valid(self, obj):
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = 'Válida'
