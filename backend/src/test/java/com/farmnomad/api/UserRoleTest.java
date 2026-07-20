package com.farmnomad.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.farmnomad.api.users.UserRole;
import org.junit.jupiter.api.Test;

class UserRoleTest {
  @Test
  void rolesUseConfirmedFarmNomadNames() {
    assertThat(UserRole.values())
        .extracting(Enum::name)
        .containsExactly("FARMER", "KITCHEN", "ORGANISATION", "CUSTOMER", "DRIVER", "ADMIN");
  }
}
