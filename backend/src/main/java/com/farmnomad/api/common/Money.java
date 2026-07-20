package com.farmnomad.api.common;

import jakarta.validation.constraints.Min;

public record Money(@Min(0) int pence, String currency) {
  public Money {
    if (currency == null || currency.isBlank()) {
      currency = "GBP";
    }
  }
}
