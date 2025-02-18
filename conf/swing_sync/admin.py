from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'created_at', 'id')
    search_fields = ('username', 'created_at', 'id') 
    list_filter = ('created_at', 'id')
