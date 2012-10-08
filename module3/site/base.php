<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Simple News - <?php echo htmlentities($title); ?></title>
        <!--[if lt IE 9]>
            <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <link href="styles/screen.css" rel="stylesheet" type="text/css">
    </head>
 
    <body>
        <?php include "header.php"; ?>
        <div class="wrapper-content">
            <section>
                <div class="wrapper-articles">
                    <?php include $main_page; ?>
                </div>
            </section>
            <aside>
                <div class="wrapper-aside">
                    <?php include "side_menu.php"; ?>
                </div>
            </aside>
            <div class="clear-footer"></div>
        </div>

        <footer>
            <p>Rapid Prototype Development and Creative Programming</p>
            <p>Jo&atilde;o Felipe Nicolaci Pimentel</p>
            <p>Tiago Pimentel Martins da Silva</p>
            
        </footer>
    </body>
</html>