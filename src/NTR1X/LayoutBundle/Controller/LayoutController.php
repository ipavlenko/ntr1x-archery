<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LayoutController extends Controller
{
    /**
     * @Route("/admin/settings", name="admin-settings")
     */
    public function viewSettingsAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {

            $view['domains'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Domain')
                ->findAll(['name'=>'asc'])
            ;

            $view['pages'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Page')
                ->findAll(['name'=>'asc'])
            ;

            $view['schemes'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Schema')
                ->findAll(['name'=>'asc'])
            ;

            $view['widgets'] = $this
                ->get('ntr1_x_layout.widget.manager')
                ->getWidgets()
            ;

            $view['categories'] = $this
                ->get('ntr1_x_layout.category.manager')
                ->getCategories()
            ;

            // dump($view['widgets']);

            // $view['widgets'] = $this
            //     ->getDoctrine()
            //     ->getRepository('NTR1XLayoutBundle:Widget')
            //     ->findAll(['name'=>'asc'])
            // ;
        });

        return $this->render('NTR1XLayoutBundle:private-settings.html.twig', [
            'settings' => $view
        ]);
    }

    /**
     * @Route("/settings", name="settings")
     */
    public function settingsAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {

            $view['domains'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Domain')
                ->findBy([], ['name'=>'asc'])
            ;

            $view['pages'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Page')
                ->findBy([], ['name'=>'asc'])
            ;

            $view['schemes'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Schema')
                ->findBy([], ['name'=>'asc'])
            ;
        });

        $serializer = $this->container->get('jms_serializer');

        $response = (new Response())
            ->setContent($serializer->serialize($view, 'json'))
            ->setStatusCode(Response::HTTP_OK)
        ;

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/settings/do-update", name="settings-do-update")
     */
    public function doUpdateSettingsAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$view) {

            $settings = $serializer->deserialize($request->getContent(), 'array', 'json');

            $this->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Domain')
                ->saveDomains($settings['domains'])
            ;

            $this->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Page')
                ->savePages($settings['pages'])
            ;

            $this->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Schema')
                ->saveSchemes($settings['schemes'])
            ;

            $em->clear();

            $view['domains'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Domain')
                ->findBy([], ['name'=>'asc'])
            ;

            $view['pages'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Page')
                ->findBy([], ['name'=>'asc'])
            ;

            $view['schemes'] = $this
                ->getDoctrine()
                ->getRepository('NTR1XLayoutBundle:Schema')
                ->findBy([], ['name'=>'asc'])
            ;
        });

        $response = (new Response())
            ->setContent($serializer->serialize($view, 'json'))
            ->setStatusCode(Response::HTTP_OK)
        ;

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function assetAction($asset) {

        $kernel = $this->container->get('kernel');
        // dump(file_get_contents($kernel->locateResource('@' . $asset->getRenderPath())));

        try {
            $path = $kernel->locateResource($asset->getRenderPath());
            $content = file_get_contents($path);
        } catch (\Exception $e) {
            $content = '';
        }

        return new Response("\n".$content);
    }
}
