src/
├── app.module.ts
├── main.ts
├── config/             # Global configurations
├── integrations/       # Third-party clients (Supabase, Vercel Blob)
├── middleware/         # Global or shared HTTP middleware
└── modules/            # Dedicated folder for all feature domains
    ├── products/
    │   ├── controller.ts
    │   ├── dto/
    │   ├── entities/
    │   ├── module.ts
    │   └── service.ts
    └── users/
        ├── controller.ts
        ├── dto/
        ├── entities/
        ├── module.ts
        └── service.ts

Common commands:
nest g res path/<module-name>
    - Generates a new module with controller, dto, module, and service
nest g s path/<module-name>
    - Generates a new service in a module
nest g c path/<module-name>
    - Generates a new controller in a module
nest g d path/<module-name>
    - Generates a new dto in a module
nest g e path/<module-name>
    - Generates a new entity in a module
    