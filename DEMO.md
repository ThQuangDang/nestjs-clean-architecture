## API: Create Service (POST /services)

**Description:** Allows a user with the `PROVIDER` role to create a new service.

**Endpoint:** `POST /services`

### Processing Flow

1.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information to the request context.
2.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Create, Service)`).
    * If the user's role does not grant the `Create` action on `Service`: Returns `403 Forbidden`. Processing stops.
3.  **DTO Validation(`CreateServiceDto`):**  
        * `name`: `@IsNotEmpty()`, `@IsString()`, `@MaxLength(255)`  
        * `description`: `@IsOptional()`, `@IsString()`, `@MaxLength(20000)`  
        * `price`: `@IsNotEmpty()`, `@IsNumber()`, `@IsPositive()`  
    * If DTO validation fails, the system stops and returns `400 Bad Request` with validation errors.
4.  **Use Case Execution (`CreateServiceUseCase`):**
    * **Check Unique Name:** Calls `serviceRepository.getServiceByName(name)`.
        * If a service with the same name exists: Throws `exceptionsService.badRequestException`. Returns `400 Bad Request`. Processing stops.
    * **Check Provider Existence:** Calls `providerRepository.findProviderByUserId(userId)`.
        * If no Provider is found linked to `userId`: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`. Processing stops.
    * **Create Service:** Calls `serviceRepository.createService({ name, price, providerId: provider.id })`. This persists the new service record in the database.
    * Returns the created Service entity.
5.  **Response Formatting:** The controller uses `CreateServicePresenter` to format the created Service entity.
    * Returns `201 Created` with the formatted service data in the response body.

[SEQUENCE-DIAGRAM](https://shorturl.at/Puw1P)
---

## API: Update Service (PATCH /services/:id)

**Description:** Allows a user with the `PROVIDER` role to update an existing service by its ID.

**Endpoint:** `PATCH /services/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the PATCH request at `/services/:id`.
    * The service `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer, the system stops and returns `400 Bad Request`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Update, Service)`).
    * If the user's role does not grant the `Update` action on `Service`: Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation(`UpdateServiceDto`):**
    * The incoming request body is validated against `UpdateServiceDto`. `UpdateServiceDto` extends `PartialType(CreateServiceDto)`, meaning fields from `CreateServiceDto` are optional.
    * **DTO Checks (Example based on validators):**
        * `name`: `@IsOptional()`, `@IsString()`, `@MaxLength(255)`
        * `description`: `@IsOptional()`, `@IsString()`, `@MaxLength(20000)`
        * `price`: `@IsOptional()`, `@IsNumber()`, `@IsPositive()`
        * `status`: `@IsOptional()`, `@IsEnum(ServiceStatusEnum)`, `@Transform()` (handles string to number conversion)
    * If DTO validation fails, the system stops and returns `400 Bad Request` with validation errors.
5.  **Use Case Execution (`UpdateServiceUseCase`):**
    * The controller calls `updateServiceUseCase.execute({ id: paramId, userId }, updateServiceDto)`.
    * **Check Provider Existence:** Calls `validateProvider(userId)` -> `providerRepository.findProviderByUserId(userId)`.
        * If no Provider is found linked to `userId`: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`. Processing stops.
    * **Check Service Existence and Ownership:** Calls `checkServiceExist({ id: paramId, providerId: provider.id })` -> `serviceRepository.findOnService({ id: paramId, providerId: provider.id })`. This checks if a service with the given ID exists *and* belongs to the authenticated Provider.
        * If the service is not found for this Provider: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`. Processing stops.
    * **Update Service:** Calls `serviceRepository.updateService({ id: paramId, providerId: provider.id }, servicePayload)`. This updates the service record in the database. The method signature suggests it returns a boolean (`Promise<boolean>`).
    * Returns a boolean result (true/false) indicating success or failure of the update operation itself.
6.  **Response Formatting:** The controller uses `UpdateServicePresenter` with the boolean result from the Use Case.
    * Returns `200 OK` with the formatted result (likely a success indicator).

[SEQUENCE-DIAGRAM](https://shorturl.at/WmgA5)
---

## API: Get List Services (GET /services)

**Description:** Allows authenticated users to retrieve a list of services, with results filtered based on the user's role and query parameters. Status is returned directly from the database.

**Endpoint:** `GET /services`

### Processing Flow

1.  **Request Reception & Query Parameter Parsing:**
    * The system receives the GET request at `/services`.
    * Query parameters are automatically parsed and mapped to `GetListServiceDto`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation(`GetListServiceDto`):**
    * The incoming query parameters are validated against `GetListServiceDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsOptional()`, `@IsEnum()`, `@Transform()`
        * `search`: `@IsOptional()`, `@IsString()`, `@MinLength(3)`
        * `sortBy`: `@IsOptional()`, `@IsIn(['createdAt', 'name', 'price'])`
        * `sortOrder`: `@IsOptional()`, `@IsIn(['ASC', 'DESC'])`, `@Transform()`
        * `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`
        * `offset`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`
        * `providerId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution (`GetListServiceUseCase`):**
    * Calls `getListServiceUseCase.execute({ ...querySearchParam, userId })`.
    * **Fetch User:** Calls repository to get the user by `userId` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`. Processing stops.
    * **Determine Filters based on Role:**
        * Initializes `providerId` and `status` filters based on `queryParams`.
        * **If `user.role === RoleEnum.ADMIN`:** `providerId` and `status` filters remain as provided.
        * **If `user.role === RoleEnum.CLIENT`:** Sets `status = ServiceStatusEnum.ACTIVE` and `providerId = undefined`.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository to get the Provider linked to the user using `checkProvider(userId)`. If not found, throws `notFoundException`. Sets `providerId = provider.id`, uses query `status`.
    * **Fetch Services:** Calls repository method `findServices()` using the determined `providerId` and `status` filters, plus other query params (search, pagination, sort).
    * **Map Results:** Maps the resulting Service entities to the desired output format, including the `status` field directly from the DB.
    * Returns the list of mapped services.
6.  **Response Formatting:** The controller maps results to Presenter.
    * Returns `200 OK`  with the list of formatted service data.

[SEQUENCE-DIAGRAM](https://shorturl.at/oNU3p)
---

## API: Get Service Detail (GET /services/:id)

**Description:** Allows authenticated users to retrieve the details of a specific service by its ID, with access rules varying by user role. Status is returned directly from the database.

**Endpoint:** `GET /services/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the GET request at `/services/:id`.
    * The service `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role and service ownership/status is handled inside the Use Case.
4.  **DTO Validation:**
    * No DTO validation step here as there is no request body or query parameters to validate.
5.  **Use Case Execution (`GetDetailServiceUseCase`):**
    * Calls `getDetailServiceUseCase.execute({ id: paramId, userId })`.
    * **Check User:** Calls repository to get the user by `userId` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("User not found"). Processing stops.
    * **Get Service Detail (`getDetailService` method):**
        * Calls repository method `serviceRepository.getServiceById(id)` to get the service by ID.
        * If service is not found by ID: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Service not found"). Processing stops.
        * If service found: Apply role-based access control:
            * **If `user.role === RoleEnum.ADMIN`:** Returns the service entity directly.
            * **If `user.role === RoleEnum.PROVIDER`:** Calls repository to get the Provider linked to the user using `checkProvider(user.id, service)`. This method internally finds the provider by user ID and checks if the service's provider ID matches. If Provider not found or service does not belong to this Provider, throws `forbiddenException`. If owned, returns the service entity.
            * **If other roles (e.g., CLIENT):** Checks if `service.status !== ServiceStatusEnum.ACTIVE`. If not active, throws `forbiddenException`. If active, returns a *partial* service object (id, name, price, description, status). Status included is the DB status.
    * Returns the service entity (or partial object) if access is allowed.
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `200 OK`  with the formatted service data.

[SEQUENCE-DIAGRAM](https://shorturl.at/qNoRc)
---

## API: Create Promotion (POST /promotions)

**Description:** Allows a user with the `PROVIDER` role to create a new promotion linked to specific services they own.

**Endpoint:** `POST /promotions` 

### Processing Flow

1.  **Request Reception:**
    * The system receives the POST request at `/promotions`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Create, Promotion)`).
    * If the user's role does not grant the `Create` action on `Promotion` (e.g., not `PROVIDER`): Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation(`CreatePromotionDto`):**
    * The incoming request body is validated against `CreatePromotionDto`.
    * **DTO Checks (Example based on validators):**
        * `name`: `@IsNotEmpty()`, `@IsString()`, `@MaxLength(255)`
        * `discount`: `@IsNotEmpty()`, `@IsNumber()`, `@Min(5)`, `@Max(100)`
        * `discountCode`: `@IsNotEmpty()`, `@IsString()`, `@MaxLength(255)`, `@Validate(IsDiscountCode)`, `@Transform()` (trim, replace spaces, uppercase)
        * `maxUsage`: `@IsNotEmpty()`, `@IsNumber()`, `@Min(1)`
        * `startDate`: `@IsNotEmpty()`, `@IsDate()`, `@Type(() => Date)`
        * `endDate`: `@IsNotEmpty()`, `@IsDate()`, `@Type(() => Date)`, `@Validate(IsStartDateBeforeEndDate)` (checks startDate < endDate)
        * `serviceIds`: `@IsNotEmpty()`, `@ValidateNested({ each: true })`, `@Type(() => CreatePromotionServiceDto)`
        * Inside `CreatePromotionServiceDto` for each item in `serviceIds` array: `@IsNotEmpty()`, `@IsNumber()` for `serviceId`.
    * If DTO validation fails, the system stops and returns `400 Bad Request` with validation errors.
5.  **Use Case Execution (`CreatePromotionUseCase`):**
    * The controller calls `createPromotionUseCase.execute({...createPromotionDto, userId, serviceIds: extractedServiceIdsArray})`.
    * **Check Discount Code Uniqueness:** Calls `checkDiscountCodeExist(discountCode)` -> `promotionRepository.findByCode(discountCode)`.
        * If discount code exists: Throws `exceptionsService.badRequestException`. Returns `400 Bad Request` ("Discount code already exist"). Processing stops.
    * **Validate Provider:** Calls `validateProvider(userId)` -> `providerRepository.findProviderByUserId(userId)`.
        * If Provider is not found linked to `userId`: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Provider not found"). Processing stops.
        * If Provider found: Returns the Provider entity.
    * **Validate Services:** Calls `validateService(provider.id, serviceIds)` -> `serviceRepository.findValidServicesByIds(serviceIds, providerId)`.
        * Fetches services by the provided IDs, checking if they are valid (e.g., active) and belong to the authenticated Provider.
        * Checks if the number of found valid services matches the number of requested `serviceIds`.
        * If count mismatch (some IDs are invalid, inactive, or don't belong to the provider): Throws `exceptionsService.badRequestException`. Returns `400 Bad Request` ("Some services are invalid or inactive"). Processing stops.
    * **Create Promotion:** Calls `promotionRepository.create({...promotion data, providerId: provider.id})`. This inserts the main promotion record into the database.
    * **Prepare Promotion-Service Links:** Maps the `serviceIds` array to an array of `PromotionService` entities (linking the new promotion ID to each service ID).
    * **Save Promotion-Service Links:** Calls `promotionServiceRepository.save(promotionServices)`. This performs batch insertion of the link records.
    * Returns the created promotion data, including the associated `serviceIds`.
6.  **Response Formatting:** The controller uses `CreatePromotionPresenter` to format the result.
    * Returns `201 Created` with the formatted promotion data in the response body.

[SEQUENCE-DIAGRAM](https://shorturl.at/ZMG3e)
---

## API: Update Promotion (PATCH /promotions/:id)

**Description:** Allows a user with the `PROVIDER` role to update an existing promotion by its ID. Supports partial updates of promotion fields and associated services.

**Endpoint:** `PATCH /promotions/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the PATCH request at `/promotions/:id`.
    * The promotion `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer, the system stops and returns `400 Bad Request`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Update, Promotion)`).
    * The user's `ability` is derived from their `role`.
    * If the user's role does not grant the `Update` action on `Promotion` (e.g., not `PROVIDER`): Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation(`UpdatePromotionDto`):**
    * The incoming request body is validated against `UpdatePromotionDto`. `UpdatePromotionDto` extends `PartialType(CreatePromotionDto)`, making most fields optional.
    * **DTO Checks (Example based on validators):**
        * Fields inherited from `CreatePromotionDto` (`name`, `discount`, `discountCode`, `maxUsage`, `startDate`, `endDate`, `serviceIds`): All are `@IsOptional()`. If a field *is* present in the payload, its original validation rules from `CreatePromotionDto` apply 
        * `status`: `@IsOptional()`, `@IsEnum(PromotionStatusEnum)`, `@Transform()`
    * If DTO validation fails, the system stops and returns `400 Bad Request` with validation errors.
5.  **Use Case Execution (`UpdatePromotionUseCase`):**
    * The controller calls `updatePromotionUseCase.execute({ id: paramId, userId }, { ...updatePromotionDto, serviceIds: extractedServiceIdsArray})`.
    * **Check Provider:** Calls `checkProvider(userId)` -> `providerRepository.findProviderByUserId(userId)`.
        * If Provider is not found linked to `userId`: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`. Processing stops.
        * If Provider found: Returns the Provider entity.
    * **Check Promotion Existence and Ownership:** Calls `checkPromotionExistence({ id: paramId, providerId: provider.id })` -> `promotionRepository.findOnPromtion({ id: paramId, providerId: provider.id })`. Checks if a promotion with the given ID exists *and* belongs to the authenticated Provider.
        * If promotion is not found for this Provider: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Promotion not found"). Processing stops.
        * If promotion found: Returns the Promotion entity (though its value is not used after the check).
    * **Conditional Discount Code Check:** If `discountCode` was provided in the payload:
        * Calls `checkDiscountCodeExist(discountCode)` -> `promotionRepository.findByCode(discountCode)`.
        * If another promotion with the same discount code exists: Throws `exceptionsService.badRequestException`. Returns `400 Bad Request` ("Discount code already exist"). Processing stops.
    * **Conditional Service IDs Update:** If `serviceIds` was provided in the payload:
        * Calls `validateServices(provider.id, serviceIds)` -> `serviceRepository.findValidServicesByIds(serviceIds, providerId)`. Checks if all provided new service IDs are valid services belonging to this provider.
        * If count mismatch (some IDs are invalid, inactive, or don't belong to the provider): Throws `exceptionsService.badRequestException`. Returns `400 Bad Request` ("Some services are invalid or inactive"). Processing stops.
        * If all new `serviceIds` are valid/owned: Calls `updatePromotionServices(promotionId, newServiceIds)`.
            * Inside `updatePromotionServices`: Calls `promotionServiceRepository.findServiceTdsByPromotionId(promotionId)` to get current links.
            * Determines which links need to be removed and which need to be added by comparing old and new IDs.
            * If services need to be removed: Calls `promotionServiceRepository.delete(...)` for each link to remove (potentially batch delete).
            * If services need to be added: Creates new `PromotionService` entities and calls `promotionServiceRepository.save(...)` (potentially batch insert).
    * **Conditional Main Promotion Update:** If any fields *other than* `serviceIds` were present in the payload OR if `discountCode` was present:
        * Calls `promotionRepository.updatePromotion({ id: promotionId }, { ...restPayload, discountCode })`. This updates the main promotion record in the database.
    * Returns a boolean value indicating update success (based on Use Case return logic).
6.  **Response Formatting:** The controller uses `UpdatePromotionPresenter` with the boolean result from the Use Case.
    * Returns `200 OK` with the formatted result

[SEQUENCE-DIAGRAM](https://shorturl.at/HK5PA)
---

## API: Get List Promotions (GET /promotions)

**Description:** Allows authenticated users to retrieve a list of promotions, with results filtered based on the user's role and query parameters. Status is returned directly from the database.

**Endpoint:** `GET /promotions`

### Processing Flow

1.  **Request Reception & Query Parameter Parsing:**
    * The system receives the GET request at `/promotions`.
    * Query parameters are automatically parsed and mapped to `GetListPromotionDto`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation(`GetListPromotionDto`):**
    * The incoming query parameters are validated against `GetListPromotionDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsOptional()`, `@IsEnum(PromotionStatusEnum)`, `@Transform()`
        * `fromDate`: `@IsOptional()`, `@Type(() => Date)`, `@IsDate()`
        * `toDate`: `@IsOptional()`, `@Type(() => Date)`, `@IsDate()`
        * `serviceId`: `@IsOptional()`, `@IsArray()`, `@IsNumber({}, { each: true })`, `@Transform()`
        * `search`: `@IsOptional()`, `@IsString()`, `@MinLength(3)`
        * `sortBy`: `@IsOptional()`, `@IsIn(['createdAt', 'name', 'discount'])`
        * `sortOrder`: `@IsOptional()`, `@IsIn(['ASC', 'DESC'])`, `@Transform()`
        * `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`
        * `offset`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`
        * `providerId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution (`GetListPromotionUseCase`):**
    * Calls `getListPromotionUseCase.execute({ ...querySearchParam, userId })`.
    * **Fetch User:** Calls repository method `userRepository.getUserById(userId)` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("User not found"). Processing stops.
    * **Determine ProviderId Filter based on Role:**
        * Initializes `providerId` and `status` filters based on `queryParams`.
        * **If `user.role === RoleEnum.ADMIN`:** `providerId` and `status` filters remain as provided.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository method `providerRepository.findProviderByUserId(userId)` using `checkProvider(user.id)`. If not found, throws `notFoundException`. Sets `providerId = provider.id`, uses query `status`.
        * **If `user.role === RoleEnum.CLIENT`:** Sets `status = PromotionStatusEnum.ACTIVE` and `providerId = undefined`.
    * **Fetch Promotions:** Calls repository method `promotionRepository.findPromotions()` using the determined `providerId` and `status` filters, plus other query params (dates, serviceId array, search, pagination, sort).
    * Returns the list of promotions. Status included is the DB status.
6.  **Response Formatting:** The controller maps results to Presenter.
    * Returns `200 OK` (or `201 Created`) with the list of formatted promotion data.

[SEQUENCE-DIAGRAM](https://shorturl.at/a6lRM)
---
  
## API: Get Promotion Detail (GET /promotions/:id)

**Description:** Allows authenticated users to retrieve the details of a specific promotion by its ID, with access rules varying by user role. Status is returned directly from the database.

**Endpoint:** `GET /promotions/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the GET request at `/promotions/:id`.
    * The promotion `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role, ownership, and status is handled inside the Use Case.
4.  **DTO Validation:**
    * No DTO validation step here as there is no request body or query parameters to validate.
5.  **Use Case Execution (`GetDetailPromotionUseCase`):**
    * Calls `getDetailPromotionUseCase.execute({ promotionId: paramId, userId })`.
    * Calls `checkUser(params.userId)` to get the user by `userId`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("User not found"). Processing stops.
    * Calls `getDetailPromotion(params.promotionId, user)`:
        * Calls `checkPromotion(id)` -> `promotionRepository.getPromotionById(id)` to get the promotion by ID.
            * If promotion is not found by ID: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Promotion not found"). Processing stops.
            * If promotion found: Returns the promotion entity.
        * Calls `checkPromotionService(id)` -> `promotionServiceRepository.findServiceTdsByPromotionId(id)` to get associated service IDs.
            * If no service links are found for this promotion: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Service not found"). Processing stops.
            * If links found: Returns the array of service IDs.
        * **Apply Role-based Access Control:**
            * **If `user.role === RoleEnum.ADMIN`:** Returns the full promotion entity and service IDs directly.
            * **If `user.role === RoleEnum.PROVIDER`:** Calls `checkProvider(user.id, promotion)`. This method internally gets the Provider by user ID and checks if the promotion belongs to them. If Provider not found or promotion does not belong to this Provider, throws `forbiddenException`. If owned, the method returns (doesn't throw). After `checkProvider` returns, the Use Case returns the full promotion entity and service IDs.
            * **If other roles (e.g., CLIENT):** Checks if `promotion.status !== PromotionStatusEnum.ACTIVE`. If not active, throws `exceptionsService.forbiddenException`. Returns `403 Forbidden` ("You can only view active promotion."). Processing stops. If active, returns a partial promotion object (id, name, discount, discountCode, startDate, endDate, serviceIds, status - *status is the DB status*).
    * Returns the promotion data (full or partial) if access is allowed.
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `200 OK` (or `201 Created`) with the formatted promotion data.

[SEQUENCE-DIAGRAM](https://shorturl.at/VqhkU)
---

## API: Create Appointment (POST /appointments/:id)

**Description:** Allows an authenticated user (Client) to create a new appointment for a specific service provided by a provider.

**Endpoint:** `POST /appointments/:id` (where `:id` is the `serviceId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the POST request at `/appointments/:id`.
    * The service `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Create, Appointment)`). This is likely granted to the `CLIENT` role.
    * If the user is not authorized: Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation(`CreateAppointmentDto`):**
    * The incoming request body is validated against `CreateAppointmentDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `appointmentTime`: `@IsNotEmpty()`, `@IsDate()`, `@Type(() => Date)`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution (`CreateAppointmentUseCase`):**
    * Calls `createAppointmentUseCase.execute({ userId, serviceId: paramId }, createAppointmentDto)`.
    * **Check Client:** Calls repository method `clientRepository.findClientByUserId(userId)` using `checkClient(userId)` to find the client linked to the user.
        * If client is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Client not found"). Processing stops.
    * **Check Service:** Calls repository method `serviceRepository.getServiceById(serviceId)` using `checkService(serviceId)` to find the service by ID.
        * If service is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Service not found"). Processing stops.
        * If service found: Checks if `service.status === ServiceStatusEnum.INACTIVE`. If inactive, throws `exceptionsService.forbiddenException`. Returns `403 Forbidden` ("You can only view active services."). Processing stops.
        * If service found and active: Returns the service entity.
    * **Check Provider:** Calls repository method `providerRepository.getProviderById(service.providerId)` using `checkProvider(service.providerId)` to find the provider linked to the service.
        * If provider is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("Provider not found"). Processing stops.
    * **Create Appointment:** Calls repository method `appointmentRepository.createAppointment({...})` to create and persist the new appointment record in the database.
    * **Send Mail Notification:** Calls `sendMail({...})` which uses `gmailService.sendAppointmentNotificationToProvider(...)` to send an email notification to the provider about the new appointment. (Note: This is an external call and is not part of a database transaction with the appointment creation).
    * Returns the created appointment entity.
6.  **Response Formatting:** The controller maps the result to a Presenter.
    * Returns `201 Created` with the formatted appointment data.

[SEQUENCE-DIAGRAM](https://shorturl.at/TmIpb)
---

## API: Update Appointment Status (PATCH /appointments/:id/status)

**Description:** Allows the Client or Provider associated with an appointment to update its status, based on allowed transitions for their role.

**Endpoint:** `PATCH /appointments/:id/status` (where `:id` is the `appointmentId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the PATCH request at `/appointments/:id/status`.
    * The appointment `id` is extracted from the path parameter (`@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission (`ability.can(ActionEnum.Update, Appointment)`). This is likely granted to `CLIENT` and `PROVIDER` roles.
    * If the user is not authorized: Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation(`UpdateStatusAppointmentDto`):**
    * The incoming request body is validated against `UpdateStatusAppointmentDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsNotEmpty()`, `@IsEnum(AppointmentStatusEnum)`, `@Transform()`, `@Validate(IsStatusAppointment)` (Custom validator checking if status is CONFIRMED or CANCELED)
        * `cancelReason`: `@IsOptional()`, `@IsString()`, `@MaxLength(255)`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution (`UpdateStatusAppointmentUseCase`):**
    * Calls `updateStatusAppointmentUseCase.execute({ userId, appointmentId: paramId }, updateStatusAppointmentDto)`.
    * **Check User and Role:** Calls repository method `userRepository.getUserById(userId)` using `checkUser(userId)`.
        * If user not found: Throws `notFoundException`. Returns `404 Not Found` ("User not found"). Processing stops.
        * If user role is not `CLIENT` or `PROVIDER`: Throws `forbiddenException`. Returns `403 Forbidden` ("User role is not allowed..."). Processing stops.
    * **Check Appointment and Ownership:** Calls repository method `appointmentRepository.getAppointmentById(appointmentId)` using `checkAppointment(user.role, appointmentId, user.id)` to find the appointment by ID.
        * If appointment not found: Throws `notFoundException`. Returns `404 Not Found` ("Appointment not found"). Processing stops.
        * If appointment found, checks if the user is *either* the client (`appointment.clientuserid === user.id`) *or* the provider (`appointment.provideruserid === user.id`) of this appointment. If not, throws `forbiddenException`. Returns `403 Forbidden` ("User is not authorized..."). Processing stops.
        * If appointment found and owned: Returns the appointment entity (which includes current `status`, `servicename`, `appointmenttime`, `clientid`, `providerid`).
    * **Check Allowed Status Transition:** Calls `checkAllowedStatusTransition(appointment.status, payload.status, user.role)`. Checks if moving from the `appointment.status` to `payload.status` is allowed based on the user's role and the `ALLOWED_STATUS_TRANSITIONS` mapping.
        * If transition is not allowed: Throws `badRequestException`. Returns `400 Bad Request` ("Invalid status transition..."). Processing stops.
    * **Update Appointment Status:** Calls repository method `appointmentRepository.updateAppointment(...)` to update the appointment's status in the database.
    * **Fetch Client and Provider Profiles:** Calls repository methods `clientRepository.getClientById(appointment.clientid)` and `providerRepository.getProviderById(appointment.providerid)` to get the profile entities of the associated client and provider for sending notifications.
        * If either client or provider profile is null: Throws `internalServerErrorException` ("Could not retrieve complete details..."). Returns `500 Internal Server Error`. Processing stops. (This is defensive coding assuming data consistency).
    * **Send Mail Notification:** Calls `sendMail(...)` which uses `gmailService`. Based on the new status (`CANCELED` or `CONFIRMED` by Provider), calls the appropriate Gmail service method (`sendMailProviderOrClientCancel` or `sendMailProviderConfirmToClient`). Includes `cancelReason` if status is CANCELED. (Note: External call, not part of a DB transaction).
    * Returns the result of the update operation (likely boolean).
6.  **Response Formatting:** The controller maps the result to a Presenter.
    * Returns `200 OK` (or `201 Created`) with the formatted update result.

[SEQUENCE-DIAGRAM](https://shorturl.at/2x7M7)
---

## API: Get List Appointments (GET /appointments)

**Description:** Allows authenticated users (Admin, Provider, Client) to retrieve a list of appointments, filtered based on their role and query parameters.

**Endpoint:** `GET /appointments`

### Processing Flow

1.  **Request Reception & Query Parameter Parsing:**
    * The system receives the GET request at `/appointments`.
    * Query parameters are automatically parsed and mapped to `GetListAppointmentDto`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation(`GetListAppointmentDto`):**
    * The incoming query parameters are validated against `GetListAppointmentDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsOptional()`, `@IsEnum(AppointmentStatusEnum)`, `@Transform()`
        * `paymentStatus`: `@IsOptional()`, `@IsEnum(PaymentStatusEnum)`, `@Transform()`
        * `sortBy`: `@IsOptional()`, `@IsIn(['createdAt', 'appointmentTime'])`
        * `sortOrder`: `@IsOptional()`, `@IsIn(['ASC', 'DESC'])`, `@Transform()`
        * `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`
        * `offset`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`
        * `providerId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
        * `clientId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
        * `serviceId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution (`GetListAppointmentUseCase`):**
    * Calls `getListAppointmentUseCase.execute({ ...querySearchParam, userId })`.
    * **Fetch User:** Calls repository method `userRepository.getUserById(userId)` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found` ("User not found"). Processing stops.
    * **Determine Filters based on Role:**
        * Initializes `filter` object with all incoming `queryParams`.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository method `providerRepository.findProviderByUserId(user.id)` using `checkProvider(user.id)`. If not found, throws `notFoundException`. Sets `filter.providerId = provider.id`.
        * **If `user.role === RoleEnum.CLIENT`:** Calls repository method `clientRepository.findClientByUserId(user.id)` using `checkClient(user.id)`. If not found, throws `notFoundException`. Sets `filter.clientId = client.id`.
        * **If `user.role === RoleEnum.ADMIN`:** No explicit filter modification based on user ID. Filters `providerId` and `clientId` (if provided in query params) are used directly from `queryParams`.
    * **Fetch Appointments:** Calls repository method `appointmentRepository.findAppointments(filter)` using the determined filter object.
    * Returns the list of appointments.
6.  **Response Formatting:** The controller maps results to Presenter.
    * Returns `200 OK` (or `201 Created`) with the list of formatted appointment data.

[SEQUENCE-DIAGRAM](https://shorturl.at/zIXPo)
---

## API: Get Appointment Detail (GET /appointments/:id)

**Description:** Allows authenticated users (Admin, Provider, Client) to retrieve the details of a specific appointment by its ID, with access rules varying by user role.

**Endpoint:** `GET /appointments/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the GET request at `/appointments/:id`.
    * The appointment `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)` and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role and appointment ownership is handled inside the Use Case.
4.  **DTO Validation:**
    * No DTO validation step here as there is no request body or query parameters to validate.
5.  **Use Case Execution  `GetDetailAppointmentUseCase`:**
    * Calls `getDetailAppointmentUseCase.execute({ id: paramId, userId })`.
    * **Check User:** Calls repository method `userRepository.getUserById(userId)` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"User not found"`. Processing stops.
    * **Check Appointment Existence:** Calls repository method `appointmentRepository.findById(appointmentId)` using `checkAppointment(id)`.
        * If appointment is not found by ID: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Appointment not found"`. Processing stops.
        * If appointment found: Returns the appointment entity.
    * **Apply Role-based Access Control:**
        * **If `user.role === RoleEnum.ADMIN`:** Returns the appointment entity directly.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository method `providerRepository.findProviderByUserId(user.id)` using `checkProvider(user.id, appointment)`. This method internally gets the Provider by user ID and checks if the appointment's provider ID matches. If Provider not found or appointment does not belong to this Provider, throws `forbiddenException`. If owned, the method returns (doesn't throw). After `checkProvider` returns, the Use Case returns the appointment entity.
        * **If `user.role === RoleEnum.CLIENT`:** Calls repository method `clientRepository.findClientByUserId(user.id)` using `checkClient(user.id, appointment)`. This method internally gets the Client by user ID and checks if the appointment's client ID matches. If Client not found or appointment does not belong to this Client, throws `forbiddenException`. If owned, the method returns (doesn't throw). After `checkClient` returns, the Use Case returns the appointment entity.
        * **If other roles:** Throws `exceptionsService.forbiddenException`. Returns `403 Forbidden`  `"You are not authorized to view this appointment."`. Processing stops.
    * Returns the appointment entity if access is allowed.
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `200 OK` (or `201 Created`) with the formatted appointment data.

[SEQUENCE-DIAGRAM](https://shorturl.at/1SxKo)
---

## API: Create Invoice (POST /invoices/:id)

**Description:** Allows an authenticated user (Client) to create an invoice for an appointment, potentially applying one or more promotion codes. Promotion application is handled atomically within a transaction, but invoice creation is separate.

**Endpoint:** `POST /invoices/:id` (where `:id` is the `appointmentId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the POST request at `/invoices/:id`.
    * The appointment `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)`) and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission  `ability.can(ActionEnum.Create, Invoice)`). This is likely granted to the `CLIENT` role.
    * If the user is not authorized: Returns `403 Forbidden`. Processing stops.
4.  **DTO Validation  `CreateInvoiceDto`:**
    * The incoming request body is validated against `CreateInvoiceDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `promotionCode`: `@IsArray()`, `@IsOptional()`, `@ArrayMinSize(1)`, `@IsString({ each: true })`, `@MaxLength(255, { each: true })`
        * `dueDate`: (Not present in provided DTO, assuming it might be added or derived)
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `CreateInvoiceUseCase`:**
    * Calls `createInvoiceUseCase.execute({ userId, appointmentId: paramId }, createInvoiceDto)`.
    * **Check Client:** Calls repository method `clientRepository.findClientByUserId(userId)` using `checkClient(userId)` to find the client linked to the user.
        * If client is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Client not found"`). Processing stops.
    * **Check Appointment:** Calls repository method `appointmentRepository.getAppointmentById(appointmentId)` using `checkAppointment(appointmentId, client.id)` to find the appointment by ID and verify ownership/status.
        * If appointment is not found by ID, or does not belong to this client, or has an invalid status (CANCELED, PENDING): Throws `exceptionsService.notFoundException` or `forbiddenException`. Returns `404/403`. Processing stops.
        * If appointment found and valid: Returns appointment entity.
    * Initialize `finalPrice` with `appointment.price`.
    * **If `payload.promotionCode` array is not empty:**
        * **Validate Promotions:** Calls repository methods `promotionRepository.findPromotionsByCodes(...)` and `promotionUsageRepository.checkUniquePromotionClient(...)` using `checkPromotionCode(appointment.serviceId, client.id, payload.promotionCode)`.
            * Finds promotions by codes, verifies they apply to the service/date, checks if client hasn't used them before.
            * If any code is invalid/not found, or already used by client: Throws `notFoundException` or `badRequestException`. Returns `404/400`. Processing stops.
            * If all codes are valid and not used by client: Returns valid promotion entities.
        * **Start Promotion Transaction:** Begin a database transaction specifically for applying promotions  `queryRunner.startTransaction()`).
        * **Apply Promotions & Update Usage (Atomic/Transactional):**
            * Loop through each valid promotion:
                * Calls repository method `promotionRepository.tryIncrementUseCountAtomically(promo.id, queryRunner)`. This method is expected to perform the atomic check  `useCount < maxUsage` and increment *within the current transaction*.
                * If `tryIncrementUseCountAtomically` returns false (indicating limit reached concurrently): Throw a specific error  `PromotionMaxUsageReached`.
                * If successful (returns true): Calls repository method `promotionUsageRepository.create({ promotionId, clientId }, queryRunner)` to create a Promotion Usage record *within the transaction*. Adds the promotion to an `appliedPromotion` list.
            * If the loop completes without throwing an error: Calculate `totalDiscountRate` and update `finalPrice` based on the `appliedPromotion` list. Ensure `finalPrice` is not negative.
        * **Commit Promotion Transaction:** If all steps within the inner transaction completed successfully, commit the transaction  `queryRunner.commitTransaction()`. Changes (incremented `useCount`, created `PromotionUsage`) are saved.
        * **Handle Promotion Transaction Rollback:** If any error occurs within the inner `try` block, the `catch` block is executed. It rolls back the transaction  `queryRunner.rollbackTransaction()` and re-throws a generic `badRequestException` (losing original error context).
        * **Release QueryRunner:** The `finally` block ensures `queryRunner.release()` is called.
    * **Create Invoice (Outside Promotion Transaction):** Calls repository method `invoiceRepository.createInvoice(...)` to create and persist the new invoice record in the database. This happens *after* the promotion transaction has finished.
    * Returns the created invoice entity.
6.  **Response Formatting:** The controller uses a Presenter to format the resulting invoice.
    * Returns `201 Created` with the formatted invoice data.

[SEQUENCE-DIAGRAM](https://shorturl.at/xUdOQ)
---

## API: Get List Invoices (GET /invoices)

**Description:** Allows authenticated users (Admin, Provider, Client) to retrieve a list of invoices, filtered based on their role and query parameters.

**Endpoint:** `GET /invoices`

### Processing Flow

1.  **Request Reception & Query Parameter Parsing:**
    * The system receives the GET request at `/invoices`.
    * Query parameters are automatically parsed and mapped to `GetListInvoiceDto`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation  `GetListInvoiceDto`:**
    * The incoming query parameters are validated against `GetListInvoiceDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsOptional()`, `@IsEnum(InvoiceStatusEnum)`, `@Transform()`
        * `inDate`: `@IsOptional()`, `@Type(() => Date)`, `@IsDate()`
        * `sortBy`: `@IsOptional()`, `@IsIn(['createdAt', 'issuedDate'])`
        * `sortOrder`: `@IsOptional()`, `@IsIn(['ASC', 'DESC'])`, `@Transform()`
        * `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`
        * `offset`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`
        * `providerId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
        * `clientId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
        * `appointmentId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `GetListInvoiceUseCase`:**
    * Calls `getListInvoiceUseCase.execute({ ...querySearchParam, userId })`.
    * **Fetch User:** Calls repository method `userRepository.getUserById(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"User not found"`). Processing stops.
    * **Determine Filters based on Role:**
        * Initializes `filter` object with all incoming `queryParams`.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository method `providerRepository.findProviderByUserId(user.id)`. If not found, throws `exceptionsService.notFoundException`. Sets `filter.providerId = provider.id`.
        * **If `user.role === RoleEnum.CLIENT`:** Calls repository method `clientRepository.findClientByUserId(user.id)`. If not found, throws `exceptionsService.notFoundException`. Sets `filter.clientId = client.id`.
        * **If `user.role === RoleEnum.ADMIN`:** No explicit filter modification based on user ID. Filters `providerId` and `clientId` (if provided in query params) are used directly from `queryParams`.
    * **Fetch Invoices:** Calls repository method `invoiceRepository.findInvoices(filter)` using the determined filter object.
    * Returns the list of invoices.
6.  **Response Formatting:** The controller maps results to Presenter.
    * Returns `200 OK` (or `201 Created`) with the list of formatted invoice data.

[SEQUENCE-DIAGRAM](https://shorturl.at/D6TA5)
---

## API: Initiate Payment (POST /invoices/:id/pay)

**Description:** Allows an authenticated user (Client) to initiate a payment process for a specific invoice using a payment gateway (Stripe). Handles existing pending payment attempts.

**Endpoint:** `POST /invoices/:id/pay` (where `:id` is the `invoiceId`)

---

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the POST request at `/invoices/:id/pay`.
    * The invoice `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)` and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation:**
    * No DTO validation step here as there is no request body or query parameters to validate.
5.  **Use Case Execution  `InitiatePaymentUseCase`:**
    * Calls `initiatePaymentUseCase.execute({ userId, invoiceId: paramId })`.
    * **Check Client:** Calls repository method `clientRepository.findClientByUserId(userId)` using `checkClient(userId)` to find the client linked to the user.
        * If client is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Client not found"`. Processing stops.
    * **Check Invoice:** Calls repository method `invoiceRepository.getInvoiceById(invoiceId)` using `checkInvoice(invoiceId, client.id)` to find the invoice by ID and verify ownership/status.
        * If invoice is not found by ID, or does not belong to this client, or has an invalid status (not PENDING): Throws `exceptionsService.notFoundException` or `forbiddenException` or `badRequestException`. Returns `404/403/400`. Processing stops.
        * If invoice found and valid: Returns invoice entity.
    * **Check for Existing Pending Payment:** Calls repository method `paymentRepository.findPendingPaymentByInvoiceId(invoice.id)`.
        * **If an existing PENDING payment is found:**
            * Attempts to retrieve the corresponding Payment Intent from Stripe using `stripeService.retrievePaymentIntent(existingPendingPayment.transactionId)`.
            * **If Stripe retrieval is successful:** Returns the existing Payment Intent's client secret and publishable key, along with the existing payment ID.
            * **If Stripe retrieval fails:** Logs the error  `logger.error`. Attempts to update the existing pending payment status to `FAILED` in the database  `paymentRepository.updatePayment`). If this DB update fails (FATAL ERROR), logs another error and throws `internalServerErrorException`. If DB update succeeds, throws `badRequestException` ("Yêu cầu thanh toán trước đó không thể tiếp tục. Vui lòng thử lại."). Processing stops.
        * **If no existing PENDING payment is found:**
            * **Create New Payment Intent (Stripe):** Attempts to create a new Payment Intent with Stripe using `stripeService.createPaymentIntent({...})`. Includes invoice, client, appointment, provider, user IDs in metadata.
            * **If Stripe Payment Intent creation is successful:**
                * Creates a new Payment record in the database using `paymentRepository.createPayment({...})` with details including the Stripe Payment Intent ID  `paymentIntent.id`.
                * Returns the new Payment Intent's client secret and publishable key, along with the new payment ID.
            * **If Stripe Payment Intent creation or subsequent Payment DB creation fails:**
                * Attempts to cancel the newly created Payment Intent in Stripe using `stripeService.cancelPaymentIntent(paymentIntent.id)` (if Payment Intent was created). Logs error if cancellation fails.
                * Throws an appropriate exception based on the original error  `internalServerErrorException` for Stripe errors or other errors, or re-throws original error. Returns `500`. Processing stops.
    * Returns payment initiation details (client secret, publishable key, payment ID).
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `201 Created` with the formatted payment initiation data.

[SEQUENCE-DIAGRAM](https://shorturl.at/RbtPI)
---

## API: Initiate Refund (POST /payments/:id/refund)

**Description:** Allows an authenticated user (Provider) to initiate a refund for a completed or partially refunded payment transaction via the payment gateway (Stripe).

**Endpoint:** `POST /payments/:id/refund` (where `:id` is the `paymentId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the POST request at `/payments/:id/refund`.
    * The payment `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)`  and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`  Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`  Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId` `role`  to the request context.
3.  **Authorization:** `PolicesGuard` checks if the authenticated user has the required permission  `ability.can(ActionEnum.Update, Payment)` . This is likely granted to the `PROVIDER` role.
    * If the user is not authorized: Returns `403 Forbidden`  Processing stops.
4.  **DTO Validation  `RefundPaymentDto` :**
    * The incoming request body is validated against `RefundPaymentDto` 
    * **DTO Checks (Example based on fields and validators):**
        * `amount` `@IsOptional()` `@IsNumber()` `@IsPositive()`         * `refundReason` `@IsOptional()` `@IsString()` `@IsIn(['duplicate', 'fraudulent', 'requested_by_customer'])`     * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `RefundPaymentUseCase` :**
    * Calls `refundPaymentUseCase.execute({ paymentId: paramId, userId }, refundPaymentDto)` 
    * **Check Provider:** Calls repository method `providerRepository.findProviderByUserId(userId)` using `checkProvider(userId)` to find the provider linked to the user.
        * If provider is not found: Throws `exceptionsService.notFoundException`  Returns `404 Not Found` `"Provider not found"` . Processing stops.
    * **Check Payment and Ownership/Status:** Calls repository method `paymentRepository.getPaymentById(paymentId)` using `checkPayment(paymentId, provider.id)` to find the payment by ID and verify ownership/status.
        * If payment is not found by ID: Throws `exceptionsService.notFoundException`  Returns `404 Not Found` `"Payment not found"` . Processing stops.
        * If payment found, checks if it belongs to the provider  `payment.providerId !== providerId` . If not, throws `exceptionsService.forbiddenException`  Returns `403 Forbidden` `"You are not allowed to access this payment"` . Processing stops.
        * Checks if payment status is `COMPLETED` or `PARTIALREFUNDED`  If not, throws `exceptionsService.badRequestException`  Returns `400 Bad Request` `"Only completed or partial refunded transactions can be refunded. Current status: ${payment.status}."` . Processing stops.
        * Checks if `payment.refundAmount >= payment.amount` (already fully refunded). If yes, throws `exceptionsService.badRequestException`  Returns `400 Bad Request` `"This transaction has been refunded."` . Processing stops.
        * If all checks pass: Returns the payment entity.
    * **Check Appointment Status:** Calls repository method `appointmentRepository.findById(payment.appointmentId)` using `checkAppointment(payment.appointmentId)` to find the related appointment.
        * If appointment not found: Throws `exceptionsService.notFoundException`  Returns `404 Not Found` `"Appointment not found"` . Processing stops.
        * Checks if appointment's payment status is `COMPLETED` or `PARTIALREFUNDED`  If not, throws `exceptionsService.badRequestException`  Returns `400 Bad Request` `"Only completed or partial refunded transactions can be refunded."` . Processing stops.
        * Checks if appointment's status is `CANCELED` or `PARTIALCOMPLETED`  If not, throws `exceptionsService.badRequestException`  Returns `400 Bad Request` `"Refunds are only allowed for canceled appointments."` . Processing stops.
        * If all checks pass: Returns the appointment entity (though not used after checks).
    * **Create Refund Payment  `createRefundPayment` :**
        * Determines the refund amount (full amount if `payload.amount` is not provided, otherwise the specified amount).
        * Validates the refund amount (must be positive and not exceed the refundable amount). If invalid, throws `exceptionsService.badRequestException`  Returns `400 Bad Request` `"This refund amount (${amountRefund}) is invalid."` . Processing stops.
        * Determines the valid Stripe refund reason from `payload.refundReason` 
        * Calls `stripeService.createRefund({...})` to initiate the refund with Stripe, using the payment's transaction ID (Payment Intent ID). Includes metadata like `paymentId` `invoiceId` `appointmentId` `refundByUserId` `refundAmount` 
        * Returns the result from Stripe  `Stripe.Refund` object).
    * Returns the Stripe Refund result.
6.  **Response Formatting:** The controller returns the Stripe Refund result directly.
    * Returns `200 OK` or `201 Created`  with the Stripe Refund object.

[SEQUENCE-DIAGRAM](https://shorturl.at/894bw)
---

## Cron Job: Create Revenue  `@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)`)

**Description:** A scheduled task that runs at midnight on the 1st day of every month to calculate the total income and commission for each provider based on completed payments from the previous month, saves the revenue records, and sends monthly revenue reports via email to providers.

### Processing Flow

1.  **Scheduled Trigger:** The system's Cron scheduler triggers the execution of the `CreateRevenueUseCase.execute()` method at the configured time (midnight on the 1st of the month).
2.  **Calculate Date Range:** Determines the start and end dates of the **previous month** using date utility functions  `subMonths`, `startOfMonth`, `endOfMonth`.
3.  **Fetch Completed Payments:** Calls repository method `paymentRepository.findCompletedPaymentInDateRange(startOfPreviousMonth, endOfPreviousMonth)` to retrieve all payment records with `status = PaymentStatusEnum.COMPLETED` within the calculated date range. Includes `amount` and `refundAmount` for calculation, and `providerId` for grouping.
4.  **Calculate Revenue per Provider:**
    * Initializes a Map  `revenueByProvider` to store aggregated income and payment counts per provider.
    * Iterates through the fetched completed payments:
        * Calculates the net amount for each payment  `payment.amount - payment.refundAmount`.
        * If the net amount is positive, adds it to the `totalIncome` for the corresponding `payment.providerId` in the map and increments the `totalPayment` count.
5.  **Process Revenue Records and Send Reports:**
    * Iterates through the entries (providerId and aggregated data) in the `revenueByProvider` map.
    * For each provider:
        * Calculates `commission`  `totalIncome * commissionRate` and `netIncome`  `totalIncome - commission`.
        * Performs basic validation (checks for `NaN`). If invalid, throws `exceptionsService.badRequestException`. (Note: This error handling might need review for a production cron job - ideally, it should log the error and continue processing other providers, or use a transaction per provider).
        * **Check for Existing Revenue Record:** Calls repository method `revenueRepository.findByProviderIdAndMonth(providerId, startOfPreviousMonth)` to see if a revenue record for this provider and month already exists.
        * **Save/Update Revenue Record:**
            * If a record exists: Updates the existing record with the new `totalIncome`, `commission`, and `netIncome` using `revenueRepository.updateRevenue(...)`. If update fails, throws `exceptionsService.badRequestException`.
            * If no record exists: Creates a new revenue record using `revenueRepository.createRevenue({...})`.
        * **Fetch Provider Details:** Calls repository method `providerRepository.getProviderById(providerId)` to get the provider's details (email, username) for sending the report.
            * If provider not found: Throws `exceptionsService.notFoundException`. (Note: Similar to the NaN check, error handling for a cron job might need to log and continue).
        * **Send Mail Report:** Calls `sendMail(...)` which uses `gmailService.sendMailMonthlyRevenueReportToProvider({...})` to send the monthly revenue report email to the provider. (Note: This is an external call and is not part of a database transaction with the revenue record save/update).
6.  **Completion:** The Cron job finishes execution.

[SEQUENCE-DIAGRAM](https://shorturl.at/GZI6Z)
---

## API: Get List Revenues (GET /revenues)

**Description:** Allows authenticated users (Admin, Provider) to retrieve a list of revenue records, filtered based on their role and query parameters.

**Endpoint:** `GET /revenues`

### Processing Flow

1.  **Request Reception & Query Parameter Parsing:**
    * The system receives the GET request at `/revenues`.
    * Query parameters are automatically parsed and mapped to `GetListRevenueDto`.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control and filtering logic based on role is handled inside the Use Case.
4.  **DTO Validation  `GetListRevenueDto`:**
    * The incoming query parameters are validated against `GetListRevenueDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `inDate`: `@IsOptional()`, `@Type(() => Date)`, `@IsDate()`
        * `sortOrder`: `@IsOptional()`, `@IsIn(['ASC', 'DESC'])`, `@Transform()`
        * `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`
        * `offset`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`
        * `providerId`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `GetListRevenueUseCase`:**
    * Calls `getListRevenueUseCase.execute({ ...querySearchParam, userId })`.
    * **Fetch User:** Calls repository method `userRepository.getUserById(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"User Not Found"`). Processing stops.
    * **Determine Filters based on Role:**
        * Initializes `filter` object with all incoming `queryParams`.
        * **If `user.role === RoleEnum.PROVIDER`:** Calls repository method `providerRepository.findProviderByUserId(queryParams.userId)`. If not found, throws `exceptionsService.notFoundException`. Sets `filter.providerId = provider.id`.
        * **If `user.role === RoleEnum.ADMIN` or other roles:** No explicit filter modification based on user ID. The `providerId` filter (if provided in query params) is used directly from `queryParams`.
    * **Fetch Revenues:** Calls repository method `revenueRepository.findRevenues(filter)` using the determined filter object.
    * Returns the list of revenues.
6.  **Response Formatting:** The controller maps results to Presenter.
    * Returns `200 OK` (or `201 Created`) with the list of formatted revenue data.

[SEQUENCE-DIAGRAM](https://shorturl.at/XBnyo)
---

## API: Get Detail Revenue (GET /revenues/:id)

**Description:** Allows authenticated users (Admin, Provider) to retrieve the details of a specific revenue record by its ID, with access rules varying by user role. Clients are not authorized to view revenue details.

**Endpoint:** `GET /revenues/:id`

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the GET request at `/revenues/:id`.
    * The revenue `id` is extracted from the path parameter ( `@Param('id', ParseIntPipe)` ) and parsed as an integer.
    * If the ID is not a valid integer: Returns  `400 Bad Request` . Processing stops.
2.  **Authentication:**  `JwtAuthGuard`  extracts and validates the JWT from the  `Authorization`  header.
    * If token is invalid: Returns  `401 Unauthorized` . Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including  `userId` ,  `role` ) to the request context.
3.  **Authorization:** No  `PolicesGuard` . Access control logic based on role and appointment ownership is handled inside the Use Case.
4.  **DTO Validation:**
    * No DTO validation step here as there is no request body or query parameters to validate.
5.  **Use Case Execution ( `GetDetailRevenueUseCase` ):**
    * Calls  `getDetailRevenueUseCase.execute({ id: paramId, userId })` .
    * **Fetch User:** Calls repository method  `userRepository.getUserById(userId)` .
        * If user is not found: Throws  `exceptionsService.notFoundException` . Returns  `404 Not Found`  ( `"User not found"` ). Processing stops.
    * **Check Revenue Existence:** Calls repository method  `revenueRepository.findById(id)` .
        * If revenue is not found by ID: Throws  `exceptionsService.notFoundException` . Returns  `404 Not Found`  ( `"Revenue not found"` ). Processing stops.
        * If revenue found: Returns the revenue entity.
    * **Apply Role-based Access Control:**
        * **If  `user.role === RoleEnum.ADMIN` :** Returns the revenue entity directly.
        * **If  `user.role === RoleEnum.PROVIDER` :** Calls repository method  `providerRepository.findProviderByUserId(params.userId)`  to find the provider linked to the user.
            * If Provider not found: Throws  `exceptionsService.notFoundException` . Returns  `404 Not Found`  ( `"Provider not found"` ). Processing stops.
            * Checks if the Provider is the owner ( `provider.id === revenue.providerId` ). If not, throws  `exceptionsService.forbiddenException` . Returns  `403 Forbidden`  ( `"You can only view your own revenue."` ). Processing stops.
            * If Provider is the owner: Returns the revenue entity.
        * **If other roles (e.g., CLIENT):** Throws  `exceptionsService.forbiddenException` . Returns  `403 Forbidden`  ( `"You are not authorized to view this revenue."` ). Processing stops. (This check is redundant if Policy blocks, but provides a clear message).
    * Returns the revenue entity if access is allowed.
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns  `200 OK`  (or  `201 Created` ) with the formatted revenue data.

[SEQUENCE-DIAGRAM](https://shorturl.at/Xh8D8)
---

## API: Create Review (POST /reviews/:id)

**Description:** Allows an authenticated user (Client) to create a review for a completed or partially completed appointment they were the client for.

**Endpoint:** `POST /reviews/:id` (where `:id` is the `appointmentId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the POST request at `/reviews/:id`.
    * The appointment `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)` and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role and appointment ownership is handled inside the Use Case.
4.  **DTO Validation  `CreateReviewDto`:**
    * The incoming request body is validated against `CreateReviewDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `rating`: `@IsNotEmpty()`, `@IsNumber()`, `@Min(1)`, `@Max(5)`
        * `comment`: `@IsOptional()`, `@IsString()`, `@MaxLength(255)`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `CreateReviewUseCase`:**
    * Calls `createReviewUseCase.execute(createReviewDto, { appointmentId: paramId, userId })`.
    * **Check Client:** Calls repository method `clientRepository.findClientByUserId(params.userId)` using `checkClient(params.userId)` to find the client linked to the user.
        * If client is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Client not found"`. Processing stops.
    * **Check Appointment and Ownership/Status:** Calls repository method `appointmentRepository.findById(params.appointmentId)` using `checkAppointment(params.appointmentId, client.id)` to find the appointment by ID and verify ownership/status.
        * If appointment is not found by ID: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Appointment not found"`. Processing stops.
        * If appointment found, checks if it belongs to this client  `appointment.clientId !== clientId`. If not, throws `exceptionsService.forbiddenException`. Returns `403 Forbidden`  `"You are not the client for this appointment."`. Processing stops.
        * Checks if appointment status is `COMPLETED` or `PARTIALCOMPLETED`. If not, throws `exceptionsService.badRequestException`. Returns `400 Bad Request`  `"Only completed appointments can be evaluated. Current status: ${AppointmentStatusEnum[appointment.status]}."`. Processing stops.
        * If all checks pass: Returns the appointment entity.
    * **Check for Existing Review:** Calls repository method `reviewRepository.getReviewByAppointmentId(params.appointmentId)` using `existingReview(params.appointmentId)` to check if a review already exists for this appointment.
        * If a review exists: Throws `exceptionsService.badRequestException`. Returns `400 Bad Request`  `"This appointment has been evaluated by you."`. Processing stops.
    * **Create Review:** Calls repository method `reviewRepository.createReview({...})` to create and persist the new review record in the database, linking it to the appointment, client, provider, and service.
    * Returns the created review entity.
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `201 Created` with the formatted review data.

[SEQUENCE-DIAGRAM](https://shorturl.at/TU8ZA)
---

## API: Update Review (PATCH /reviews/:id)

**Description:** Allows an authenticated user (Client) to update an existing review they created. If the review was previously approved, updating it will trigger a recalculation of the average rating by adding a job to a queue.

**Endpoint:** `PATCH /reviews/:id` (where `:id` is the `reviewId`)

---

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the PATCH request at `/reviews/:id`.
    * The review `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)` and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role and appointment ownership is handled inside the Use Case.
4.  **DTO Validation  `UpdateReviewDto`:**
    * The incoming request body is validated against `UpdateReviewDto` (which extends `PartialType(CreateReviewDto)`).
    * **DTO Checks (Example based on fields and validators):**
        * `rating`: `@IsOptional()`, `@IsNumber()`, `@Min(1)`, `@Max(5)`
        * `comment`: `@IsOptional()`, `@IsString()`, `@MaxLength(255)`
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `UpdateReviewUseCase`:**
    * Calls `updateReviewUseCase.execute({ id: paramId, userId }, updateReviewDto)`.
    * **Check Client:** Calls repository method `clientRepository.findClientByUserId(params.userId)` using `checkClient(params.userId)` to find the client linked to the user.
        * If client is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Client not found"`. Processing stops.
    * **Check Existing Review and Ownership:** Calls repository method `reviewRepository.findOnReview(reviewId, clientId)` using `existingReview(params.id, client.id)` to find the review by ID and verify it belongs to this client.
        * If review is not found for this client: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Review not found"`. Processing stops.
        * If review found: Returns the review entity (including `status`, `serviceId`, `rating`, `providerId`).
    * **Conditional Queue Job for Avg Rating:**
        * Checks if the fetched `review.status === ReviewStatusEnum.APPROVED`.
        * If it is APPROVED: Calls `reviewAvgRatingService.addreviewAvgRatingQueue(review.serviceId, review.rating, review.providerId, 'reject')` to add a job to the queue. This job will instruct the queue consumer to remove the old rating from the average calculation.
    * **Update Review:** Calls repository method `reviewRepository.updateReview({ id: review.id }, { ...payload, status: ReviewStatusEnum.PENDING })` to update the review record in the database. Sets the status to `PENDING` regardless of the incoming payload, requiring re-approval.
    * Returns the result of the update operation (likely boolean or updated entity).
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `200 OK` (or `201 Created`) with the formatted update result.

[SEQUENCE-DIAGRAM](https://shorturl.at/cIknF)
---

## API: Update Review Status (PATCH /reviews/:id/status)

**Description:** Allows an authenticated user (likely Admin) to update the status of an existing review. Approving or rejecting a review triggers a recalculation of the average rating by adding a job to a queue.

**Endpoint:** `PATCH /reviews/:id/status` (where `:id` is the `reviewId`)

### Processing Flow

1.  **Request Reception & Parameter Parsing:**
    * The system receives the PATCH request at `/reviews/:id/status`.
    * The review `id` is extracted from the path parameter  `@Param('id', ParseIntPipe)` and parsed as an integer.
    * If the ID is not a valid integer: Returns `400 Bad Request`. Processing stops.
2.  **Authentication:** `JwtAuthGuard` extracts and validates the JWT from the `Authorization` header.
    * If token is invalid: Returns `401 Unauthorized`. Processing stops.
    * If token is valid: Authenticates the user and attaches user information (including `userId`, `role`) to the request context.
3.  **Authorization:** No `PolicesGuard`. Access control logic based on role and appointment ownership is handled inside the Use Case.
4.  **DTO Validation  `UpdateStatusReivewDto`:**
    * The incoming request body is validated against `UpdateStatusReivewDto`.
    * **DTO Checks (Example based on fields and validators):**
        * `status`: `@IsNotEmpty()`, `@Transform()`, `@IsEnum(ReviewStatusEnum)`, `@Validate(IsApproveOrReject)` (Custom validator checking for APPROVED or REJECTED)
    * If DTO validation fails: Returns `400 Bad Request` with validation errors. Processing stops.
5.  **Use Case Execution  `UdpateStatusReviewUseCase`:**
    * Calls `updateStatusReviewUseCase.execute({ id: paramId, userId }, updateStatusReviewDto)`.
    * **Check User:** Calls repository method `userRepository.getUserById(userId)` using `checkUser(userId)`.
        * If user is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"User not found"`. Processing stops. (Note: Role check is handled by Policy Guard before Use Case).
    * **Check Existing Review:** Calls repository method `reviewRepository.getReviewById(id)` using `existingReview(params.id)` to find the review by ID.
        * If review is not found: Throws `exceptionsService.notFoundException`. Returns `404 Not Found`  `"Review not found"`. Processing stops.
        * If review found: Returns the review entity (including `status`, `serviceId`, `rating`, `providerId`).
    * **Check Allowed Status Transition & Add Queue Job:** Calls `avgRatingServiceQueue(review.status, payload.status, review)`.
        * Checks if `currentStatus === nextStatus`. If yes, throws `exceptionsService.badRequestException`  `"This review has been evaluated by you with currentStatus: ${currentStatus}"`. Returns `400 Bad Request`. Processing stops.
        * **If `nextStatus === ReviewStatusEnum.REJECTED`:** Calls `reviewAvgRatingService.addreviewAvgRatingQueue(review.serviceId, review.rating, review.providerId, 'reject')` to add a job to the queue. This job will instruct the queue consumer to remove the old rating from the average calculation.
        * **If `nextStatus === ReviewStatusEnum.APPROVED`:** Calls `reviewAvgRatingService.addreviewAvgRatingQueue(review.serviceId, review.rating, review.providerId, 'create')` to add a job to the queue. This job will instruct the queue consumer to add the new rating to the average calculation.
    * **Update Review Status:** Calls repository method `reviewRepository.updateReview({ id: review.id }, { status: payload.status })` to update the review record in the database.
    * Returns the result of the update operation (likely boolean or updated entity).
6.  **Response Formatting:** The controller uses a Presenter to format the result.
    * Returns `200 OK` (or `201 Created`) with the formatted update result.

[SEQUENCE-DIAGRAM](https://shorturl.at/JFuFI)
---
