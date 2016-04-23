<?php

namespace NTR1X\LayoutBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Reference;

class WidgetCompilerPass implements CompilerPassInterface {

    public function process(ContainerBuilder $container) {

        if (!$container->has('ntr1_x_layout.widget.manager')) return;
        if (!$container->has('ntr1_x_layout.category.manager')) return;

        $categoryManager = $container->findDefinition('ntr1_x_layout.category.manager');
        $widgetManager = $container->findDefinition('ntr1_x_layout.widget.manager');

        $categoryProviders = $container->findTaggedServiceIds('category.provider');
        $widgetProviders = $container->findTaggedServiceIds('widget.provider');

        foreach ($categoryProviders as $id=>$tags) {

            $categoryManager->addMethodCall(
                'register',
                array(new Reference($id))
            );
        }

        $categoryManager->addMethodCall('build');

        foreach ($widgetProviders as $id=>$tags) {

            $widgetManager->addMethodCall(
                'register',
                array(new Reference($id))
            );
        }

        $widgetManager->addMethodCall('build', array(
            new Reference('ntr1_x_layout.category.manager')
        ));
    }
}
