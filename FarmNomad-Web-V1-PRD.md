# FarmNomad Web App V1 PRD

## Product Name and One-Line Description

**FarmNomad** is a UK AgriTech platform that connects surplus produce, food vendors, organisations, customers, and independent drivers through one coordinated logistics, redistribution, marketplace, and delivery system.

## Problem Statement

UK farmers, kitchens, food charities, schools, community groups, and price-conscious customers operate across fragmented systems: surplus produce is often listed informally, food redistribution is coordinated through calls or spreadsheets, local produce sales happen on separate marketplaces, and delivery is arranged manually after demand already exists.

FarmNomad closes the surplus/logistics gap by treating supply, demand, order flow, and delivery coordination as one system. This matters because surplus produce is time-sensitive: a listing without reliable fulfilment still wastes food, and a delivery network without predictable supply has weak utilisation. Point solutions solve one step of the chain, but FarmNomad V1 should prove the combined workflow: Vendors list available produce, Organisations and Customers request it, Drivers coordinate fulfilment, and Admins oversee trust, safety, and disputes.

## Target User Profiles

### Farmer

Farmers are UK-based growers or producers with sellable produce, surplus harvests, imperfect produce, seasonal stock, or short-dated goods. They need a low-friction way to list produce, control pricing or donation options, see demand, and move goods quickly without managing every delivery manually.

### Kitchen

Kitchens are restaurants, caterers, bakeries, community kitchens, or food vendors with prepared food, ingredients, or surplus stock. They need listing tools that support availability windows, collection constraints, allergen or handling notes, and fast redistribution before food expires.

### Organisation

Organisations include food banks, schools, religious groups, student groups, charities, and community groups. They need reliable access to affordable or donated food, proof of source and delivery, predictable fulfilment, and the ability to request recurring or bulk supply.

### Customer

Customers are price-conscious individuals or households looking for fresh, local, discounted produce. They need a simple marketplace experience, transparent pricing, local availability, and delivery or pickup options.

### Driver

Drivers are independent couriers or local logistics partners who transport produce from Vendors to Organisations or Customers. They need clear pickup/drop-off details, route status, proof of delivery, and earnings visibility.

### Admin

Admins operate FarmNomad. They verify users, monitor listings and orders, resolve disputes, manage flagged content, oversee platform performance, and ensure the marketplace remains trustworthy.

## V1 Product Positioning

FarmNomad should be positioned as the only platform combining agricultural logistics, surplus food redistribution, local produce commerce, and delivery coordination in one operating layer.

V1 should not attempt to launch every possible marketplace category or AI feature. Its job is to prove the core network loop:

1. Vendors publish available produce or food surplus.
2. Organisations and Customers discover and request/order it.
3. Drivers fulfil deliveries with trackable statuses.
4. Admins maintain trust and operational control.

## Core Features for V1

### 1. Role-Based Authentication and Onboarding

FarmNomad needs account creation, login, JWT-based authentication, and role-specific onboarding for Farmer, Kitchen, Organisation, Customer, Driver, and Admin users. Farmer and Kitchen should sit under a shared Vendor umbrella while retaining role-specific profile fields.

#### User Stories

- As a Farmer, I want to create a vendor profile so that I can list produce from my farm.
- As a Kitchen, I want to create a vendor profile so that I can redistribute or sell surplus food.
- As an Organisation, I want to verify my organisation details so that Vendors and Admins can trust my requests.
- As a Customer, I want to sign up quickly so that I can browse and buy local produce.
- As a Driver, I want to submit my delivery profile so that I can receive fulfilment jobs.
- As an Admin, I want to view and approve pending accounts so that the platform remains trustworthy.

### 2. Surplus and Produce Listings

Vendors can create listings for produce or prepared food with quantity, unit, price, donation availability, pickup location, availability window, expiry or freshness notes, images, and handling information.

#### User Stories

- As a Farmer, I want to list surplus produce with quantity and availability so that buyers can claim it before it goes to waste.
- As a Kitchen, I want to add expiry and handling notes so that recipients understand food safety constraints.
- As an Organisation, I want to filter listings by location, donation status, and quantity so that I can find suitable supply.
- As a Customer, I want to browse affordable local produce so that I can buy fresh food at lower prices.
- As an Admin, I want to moderate listings so that misleading or unsafe listings can be removed.

### 3. Request, Order, and Allocation Workflow

Organisations can request donated or discounted supply, Customers can place paid orders, and Vendors can accept, reject, or allocate listings. V1 should support basic inventory decrementing and prevent double allocation.

#### User Stories

- As an Organisation, I want to request some or all of a listing so that I can secure food for my group.
- As a Customer, I want to place an order and pay online so that I can reserve produce confidently.
- As a Vendor, I want to accept or reject incoming requests so that I control where my stock goes.
- As a Vendor, I want listing quantities to update after confirmed orders so that I do not overcommit stock.
- As an Admin, I want to inspect order and allocation history so that I can resolve disputes.

### 4. Delivery Coordination and Status Tracking

Accepted orders can be assigned to Drivers. Drivers update delivery status from assigned to picked up, in transit, delivered, failed, or cancelled. Vendors, Organisations, Customers, and Admins can see status changes.

#### User Stories

- As a Driver, I want to see assigned pickups and drop-offs so that I know what to deliver.
- As a Driver, I want to update delivery status so that recipients and Vendors know where the order is.
- As a Vendor, I want proof that a delivery was picked up so that I can close the fulfilment loop.
- As an Organisation, I want to track delivery status so that I can plan collection or distribution.
- As a Customer, I want delivery updates so that I know when my produce will arrive.
- As an Admin, I want to reassign or cancel failed deliveries so that orders do not get stuck.

### 5. Admin Operations Dashboard

Admins need a web dashboard for account verification, listing moderation, order visibility, delivery oversight, and platform metrics.

#### User Stories

- As an Admin, I want to review pending Farmers, Kitchens, Organisations, and Drivers so that only valid users transact.
- As an Admin, I want to view active listings, orders, and deliveries so that I can monitor operational health.
- As an Admin, I want to suspend users or listings so that I can handle abuse or unsafe activity.
- As an Admin, I want to see basic metrics so that I can understand supply, demand, fulfilment, and waste reduction.

## Explicitly Out of Scope for V1

- **NomadEat**: Separate consumer food ordering or prepared-meal brand experience should wait until the main FarmNomad network loop is proven.
- **Crop disease scanner**: Valuable later, but it does not support the immediate surplus-to-delivery transaction loop.
- **Surplus-prediction ML**: V1 should collect clean listing, order, and fulfilment data first. Prediction without reliable historical data will be fragile.
- **Equipment marketplace**: Excluded from V1. It broadens categories, trust rules, listing schemas, payments, insurance, and logistics complexity before the food supply workflow is validated.
- **Recurring supply contracts**: Useful for Organisations, but V1 should start with one-off requests and orders.
- **Advanced route optimisation**: V1 should support assignment and tracking, not complex multi-stop optimisation.
- **Multi-vendor basket checkout**: Adds fulfilment and settlement complexity. V1 should support one Vendor per order.
- **Full accounting and invoicing suite**: Keep V1 to receipts, payment records, and exportable order history.
- **Native mobile apps in app stores**: Expo mobile can be developed as part of the architecture, but V1 launch can use internal testing or progressive rollout.

## Tech Stack Validation

### Confirmed Choices

- **Spring Boot + Java backend**: Strong fit for a transactional marketplace with clear domain boundaries, role-based permissions, background jobs, and integrations.
- **PostgreSQL**: Strong fit for relational marketplace data, inventory consistency, order history, user roles, and reporting.
- **JWT authentication**: Appropriate for stateless API auth across web and mobile, especially with refresh-token rotation and role claims.
- **Next.js + TypeScript web app**: Strong fit for a production web dashboard and marketplace UI with type safety, routing, and deployable frontend architecture.
- **Tailwind CSS**: Good fit for fast, consistent UI development, especially with a small design system.
- **RTK Query**: Good fit if the team is already comfortable with Redux patterns and wants typed API caching, loading states, and invalidation.
- **React Native / Expo mobile app**: Strong fit for Driver and Customer mobile workflows, faster iteration, and cross-platform delivery.
- **Python / FastAPI AI service**: Good fit for later AI features and lightweight internal intelligence services, kept separate from the main transaction backend.
- **Stripe**: Strong fit for card payments, refunds, and future marketplace payouts if paired with Stripe Connect.
- **Cloudinary**: Good fit for listing images, transformations, and media moderation workflows.
- **WebSockets/STOMP**: Suitable for real-time order, delivery, and admin updates if implemented carefully.

### Weak Points and Recommended Fixes

- **Scope risk**: The proposed platform combines marketplace, logistics, redistribution, payments, and admin operations. Fix by making V1 prove one core transaction loop before equipment, ML, subscriptions, or complex routing.
- **JWT security risk**: Plain long-lived JWTs are risky. Fix with short-lived access tokens, refresh-token rotation, device/session tracking, secure HTTP-only cookies for web, and secure storage for mobile.
- **Marketplace payments complexity**: If Drivers and Vendors will be paid through the platform, basic Stripe Checkout may not be enough. Fix by designing for **Stripe Connect** early, even if V1 only enables simple customer payments.
- **Real-time infrastructure complexity**: WebSockets/STOMP can become hard to scale and debug. Fix with a clear event model, fallback polling for non-critical screens, and Redis or broker-backed messaging when scaling.
- **Geolocation and delivery matching**: Basic PostgreSQL works, but location queries can become inefficient. Fix by enabling **PostGIS** for distance, service areas, and nearby listing search.
- **Inventory race conditions**: Multiple requests can claim the same stock. Fix with database transactions, row locking or optimistic concurrency, and explicit listing quantity reservations.
- **AI service timing**: Building the FastAPI AI service too early can distract from V1. Fix by scaffolding the service but limiting it to non-critical placeholder endpoints until enough platform data exists.
- **Operational reliability gap**: Delivery workflows need background jobs and notifications. Fix by adding Redis-backed queues or a message broker for asynchronous notifications, status events, and retries.
- **Compliance and trust**: Food redistribution needs careful records, user verification, handling notes, allergen fields, and audit trails. Fix by treating trust and moderation as V1 requirements, not admin nice-to-haves.

## Definition of Done

FarmNomad Web App V1 is launch-ready when all of the following are true:

- Users can register, log in, refresh sessions, and log out across all six roles.
- Farmer and Kitchen users can create, edit, publish, pause, and delete produce or surplus listings.
- Organisation users can browse listings and submit requests for donated or discounted food.
- Customer users can browse listings, place a paid order, and receive order confirmation.
- Vendors can accept, reject, and fulfil incoming requests or orders.
- Listing inventory cannot be oversold under concurrent requests.
- Admin users can verify users, moderate listings, inspect orders, inspect deliveries, and suspend problematic accounts.
- Drivers can view assigned deliveries and update delivery statuses.
- Order and delivery status updates are visible to the relevant Vendor, recipient, Driver, and Admin.
- Stripe test payments complete successfully and failed payments produce understandable user states.
- Cloudinary image uploads work for listings with file validation and stored media URLs.
- Core APIs have automated tests for auth, listings, orders, payments, and delivery status changes.
- Web app has smoke tests for login, listing creation, order/request flow, admin verification, and delivery tracking.
- Audit logs exist for account verification, listing moderation, order status changes, payment events, and delivery status changes.
- Basic observability is configured for backend errors, API latency, payment webhook failures, and failed background jobs.
- Deployment environments exist for local development, staging, and production.

## The Files

The initial repository should be a monorepo with separate apps and services. This keeps the product coherent while allowing independent deployment later.

```text
farmnomad/
  README.md
  .gitignore
  .env.example
  docker-compose.yml
  docs/
    FarmNomad-Web-V1-PRD.md
    architecture.md
    api-contracts.md
    data-model.md
    deployment.md
  backend/
    build.gradle
    settings.gradle
    src/
      main/
        java/com/farmnomad/api/
          FarmNomadApplication.java
          config/
            SecurityConfig.java
            WebSocketConfig.java
            CorsConfig.java
          auth/
            AuthController.java
            AuthService.java
            JwtService.java
            RefreshTokenService.java
          users/
            User.java
            UserRole.java
            UserRepository.java
            UserService.java
            VerificationStatus.java
          vendors/
            VendorProfile.java
            VendorController.java
            VendorService.java
            VendorType.java
          organisations/
            OrganisationProfile.java
            OrganisationController.java
            OrganisationService.java
          listings/
            Listing.java
            ListingController.java
            ListingService.java
            ListingRepository.java
            ListingStatus.java
          orders/
            Order.java
            OrderController.java
            OrderService.java
            OrderStatus.java
            OrderRepository.java
          deliveries/
            Delivery.java
            DeliveryController.java
            DeliveryService.java
            DeliveryStatus.java
          payments/
            PaymentController.java
            StripeService.java
            StripeWebhookController.java
          media/
            MediaController.java
            CloudinaryService.java
          admin/
            AdminController.java
            ModerationService.java
          audit/
            AuditLog.java
            AuditLogRepository.java
            AuditLogService.java
          notifications/
            NotificationEvent.java
            NotificationService.java
          common/
            ApiError.java
            PageResponse.java
            Money.java
        resources/
          application.yml
          db/migration/
            V1__init_users.sql
            V2__init_profiles.sql
            V3__init_listings.sql
            V4__init_orders_deliveries.sql
            V5__init_payments_audit.sql
      test/
        java/com/farmnomad/api/
          auth/
          listings/
          orders/
          deliveries/
  web/
    package.json
    next.config.ts
    tsconfig.json
    tailwind.config.ts
    src/
      app/
        layout.tsx
        page.tsx
        login/page.tsx
        register/page.tsx
        vendor/
          dashboard/page.tsx
          listings/page.tsx
          orders/page.tsx
        organisation/
          dashboard/page.tsx
          requests/page.tsx
        customer/
          marketplace/page.tsx
          orders/page.tsx
        admin/
          dashboard/page.tsx
          users/page.tsx
          listings/page.tsx
          orders/page.tsx
          deliveries/page.tsx
      components/
        auth/
        listings/
        orders/
        deliveries/
        admin/
        ui/
      lib/
        api/
          baseApi.ts
          authApi.ts
          listingsApi.ts
          ordersApi.ts
          deliveriesApi.ts
          adminApi.ts
        auth/
        routes.ts
        types.ts
      styles/
        globals.css
  mobile/
    package.json
    app.json
    App.tsx
    src/
      screens/
        LoginScreen.tsx
        DriverJobsScreen.tsx
        DriverDeliveryDetailScreen.tsx
        CustomerMarketplaceScreen.tsx
        CustomerOrderDetailScreen.tsx
      components/
      services/
        api.ts
        auth.ts
      navigation/
        RootNavigator.tsx
      types/
  ai-service/
    pyproject.toml
    app/
      main.py
      api/
        health.py
        recommendations.py
      core/
        config.py
      services/
        listing_recommendations.py
      tests/
  infra/
    docker/
      backend.Dockerfile
      web.Dockerfile
      ai-service.Dockerfile
    postgres/
      init.sql
  scripts/
    dev.ps1
    test.ps1
```

## V1 Data Model Summary

Core entities should include:

- **User**: login identity, role, account status, verification status.
- **VendorProfile**: Farmer or Kitchen profile, address, operating radius, fulfilment preferences.
- **OrganisationProfile**: organisation type, verification details, address, contact person.
- **Listing**: product details, quantity, unit, price, donation flag, images, location, availability window, status.
- **Order**: buyer or requesting organisation, vendor, line items, status, totals, fulfilment method.
- **Delivery**: assigned driver, pickup, drop-off, status, timestamps, proof of delivery.
- **Payment**: Stripe payment intent/session, amount, status, refund state.
- **AuditLog**: actor, action, entity type, entity id, before/after metadata, timestamp.

## V1 Success Metrics

- At least 50 verified Vendors onboarded in the first pilot region.
- At least 20 verified Organisations onboarded.
- At least 200 listings created during pilot.
- At least 60% of listed surplus quantity claimed, sold, or delivered.
- At least 90% of accepted deliveries completed without admin intervention.
- Median time from listing creation to first request under 24 hours for surplus listings.
- Admin can resolve account, listing, order, and delivery issues from the dashboard without database access.
