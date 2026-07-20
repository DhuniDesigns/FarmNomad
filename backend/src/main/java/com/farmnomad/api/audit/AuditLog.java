package com.farmnomad.api.audit;

import java.time.Instant;
import java.util.UUID;

public record AuditLog(UUID actorId, String action, String entityType, UUID entityId, Instant createdAt) {}
