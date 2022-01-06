<?php

class PluginTest extends TestCase
{
    public function test_plugin_installed() {
        activate_plugin( 'disciple-tools-custom-location-grid/disciple-tools-custom-location-grid.php' );

        $this->assertContains(
            'disciple-tools-custom-location-grid/disciple-tools-custom-location-grid.php',
            get_option( 'active_plugins' )
        );
    }
}
