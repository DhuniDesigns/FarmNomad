package com.farmnomad.api.notifications;

import java.util.UUID;

public record NotificationEvent(UUID userId, String type, String message) {}
