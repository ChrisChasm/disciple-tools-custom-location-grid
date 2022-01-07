<?php
if ( !defined( 'ABSPATH' ) ) { exit; } // Exit if accessed directly.

class DT_Custom_Location_Grid_Charts
{
    private static $_instance = null;
    public static function instance(){
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    } // End instance()

    public function __construct(){

        require_once( 'local-map.php' );
        new DT_Custom_Location_Grid_Local_Map();

    } // End __construct
}
DT_Custom_Location_Grid_Charts::instance();
