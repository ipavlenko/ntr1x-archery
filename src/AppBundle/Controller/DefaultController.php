<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

use JMS\Serializer\SerializationContext;

use AppBundle\Entity\Portal;
use AppBundle\Entity\User;
use AppBundle\Security\UserPrincipal;

class DefaultController extends Controller {

    public function __construct() {
        $this->context = new SerializationContext();
        $this->context->setSerializeNull(true);
    }

    /**
     * @Route("/edit/{id}{any}", name = "edit", requirements = { "id"="([0-9]+)", "any"="(.*)" })
     */
    public function editAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        try {

            $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view, &$serializer, &$principal) {

                $portal = $this
                    ->getDoctrine()
                    ->getRepository('AppBundle:Portal')
                    ->findOneBy([ 'id' => $request->attributes->get('id') ], [])
                ;

                $pages = $this
                    ->getDoctrine()
                    ->getRepository('AppBundle:Page')
                    ->findBy([ 'portal' => $portal ], [])
                ;

                $view['principal'] = $portal;
                $view['portal'] = $portal;
                $view['pages'] = $pages;
            });

        } catch (\Exception $e) {

            $view['error'] = [
                'message' => 'Internal server error',
                'message2' => $e->getMessage(),
            ];
        }

        return $this->render('designer.html.twig', $view);
    }

    /**
     * @Route("/view/{id}{any}", name = "view", requirements = { "id"="([0-9]+)", "any"="(.*)" })
     */
    public function viewAction(Request $request) {

        // TODO $domain = ... Взять его нужно по имени домена, с которого открыт ресурс

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        try {

            $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view, &$serializer, &$principal) {

                $portal = $this
                    ->getDoctrine()
                    ->getRepository('AppBundle:Portal')
                    ->findOneBy([ 'id' => $request->attributes->get('id') /*, 'user' => $user */ ], [])
                ;

                $pages = $this
                    ->getDoctrine()
                    ->getRepository('AppBundle:Page')
                    ->findBy([ 'portal' => $portal ], [])
                ;

                $view['portal'] = $portal;
                $view['pages'] = $pages;
            });

        } catch (\Exception $e) {

            $view['error'] = [
                'message' => 'Internal server error',
                'message2' => $e->getMessage(),
            ];
        }

        return $this->render('viewer.html.twig', $view);
    }

    /**
     * @Route("{any}", name = "home", requirements = { "any"="(.*)" })
     */
    public function defaultAction(Request $request) {

        // TODO $domain = ... Взять его нужно по имени домена, с которого открыт ресурс

        $em = $this->getDoctrine()->getManager();

        $view = [
            'principal' => $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
                ? $this->get('security.token_storage')->getToken()->getUser()
                : null
        ];

        return $this->render('landing.html.twig', $view);
    }
}
