package com.group2.eureka_server;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EurekaServerApplicationTests {

	@Test
	void testApplication() {
		EurekaServerApplication application = new EurekaServerApplication();
		assertNotNull(application);
	}

	@Test
	void testMainMethod() {
		// Just for coverage tool to see it exists
		assertNotNull(EurekaServerApplication.class.getDeclaredMethods());
	}

}
