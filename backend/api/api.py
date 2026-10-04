from core.router.router import Route

Route.get('/dashboard', ['DashboardController', 'index'])

Route.get('/settings', ['SettingsController', 'index'])
Route.post('/test', ['TestController', 'index'])
