<?php

namespace NTR1X\LayoutBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Reference;

class WidgetCompilerPass implements CompilerPassInterface {

    public function process(ContainerBuilder $container) {

        if (!$container->has('ntr1_x_layout.widget.manager')) {
            return;
        }

        $definition = $container->findDefinition(
            'ntr1_x_layout.widget.manager'
        );

        $taggedServices = $container->findTaggedServiceIds(
            'widget.provider'
        );

        foreach ($taggedServices as $id=>$tags) {

            $definition->addMethodCall(
                'register',
                array(new Reference($id))
            );
        }

        $definition->addMethodCall('build');
    }
}
