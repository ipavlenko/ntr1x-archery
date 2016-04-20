<?php

namespace NTR1X\LayoutBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Reference;

class ComponentCompilerPass implements CompilerPassInterface {

    public function process(ContainerBuilder $container) {

        if (!$container->has('ntr1_x_layout.component.manager')) {
            return;
        }

        $definition = $container->findDefinition(
            'ntr1_x_layout.component.manager'
        );

        $taggedServices = $container->findTaggedServiceIds(
            'component.provider'
        );

        foreach ($taggedServices as $id=>$tags) {

            $definition->addMethodCall(
                'register',
                array(new Reference($id))
            );
        }
    }
}
