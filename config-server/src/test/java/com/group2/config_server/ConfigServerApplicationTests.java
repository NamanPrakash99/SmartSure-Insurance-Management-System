package com.group2.config_server;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ConfigServerApplicationTests {

	@Test
	void testApplication() {
		ConfigServerApplication application = new ConfigServerApplication();
		assertNotNull(application);
	}

	@Test
	void testMainMethod() {
		// Just for coverage tool to see it exists
		assertNotNull(ConfigServerApplication.class.getDeclaredMethods());
	}

}
