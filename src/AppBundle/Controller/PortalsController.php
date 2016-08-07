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
use AppBundle\Entity\Page;
use AppBundle\Entity\Widget;
use AppBundle\Entity\User;
use AppBundle\Security\UserPrincipal;

class PortalsController extends Controller {

    public function __construct() {
        $this->context = new SerializationContext();
        $this->context->setSerializeNull(true);
    }

    /**
     * @Route("/ws/portals", name = "portals-create")
     * @Method({"POST"})
     */
    public function wsPortalsCreateAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        if (!empty($principal)) {

            try {

                $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$principal) {

                    $data = $serializer->deserialize($request->getContent(), 'array', 'json');

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = (new Portal())
                        ->setTitle($data['title'])
                        ->setUser($user)
                    ;

                    $em->persist($portal);
                    $em->flush();

                    $page = (new Page())
                        ->setName('')
                        ->setPortal($portal)
                    ;

                    $root = (new Widget())
                        ->setName('default-container/default-container-stack/default-stack-canvas')
                        ->setPage($page)
                        ->setParent(null)
                        ->setIndex(0)
                        ->setParams([
                            'width' => [ "value" => 1200 ],
                            'height' => [ "value" => null ],
                        ])
                    ;

                    $page->setRoot($root);

                    $em->persist($page);
                    $em->flush();

                    $view['portal'] = $portal;
                });

            } catch (\Exception $e) {

                $view['error'] = [
                    'message' => 'Internal server error',
                    'message2' => $e->getMessage(),
                ];

                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response->setStatusCode(Response::HTTP_OK);

        } else {

            $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
        }

        $response->setContent($serializer->serialize($view, 'json', $this->context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/ws/portals/{id}", name="portals-update")
     * @Method({"PUT"})
     */
    public function wsPortalsPutAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        if (!empty($principal)) {

            try {

                $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$principal, &$view) {

                    $data = $serializer->deserialize($request->getContent(), 'array', 'json');

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findOneBy([ 'id' => $request->attributes->get('id'), 'user' => $user ])
                    ;

                    $this->getDoctrine()
                        ->getRepository('AppBundle:Page')
                        ->savePages($portal, $data['pages'])
                    ;

                    $em->clear();

                    $view['portal'] = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findOneBy([ 'id' => $request->attributes->get('id'), 'user' => $user ])
                    ;

                    $em->flush();
                });

            } catch (\Exception $e) {

                $view['error'] = [
                    'message' => 'Internal server error',
                    'message2' => $e->getMessage(),
                ];

                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response->setStatusCode(Response::HTTP_OK);

        } else {

            $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
        }

        $response->setContent($serializer->serialize($view, 'json', $this->context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/ws/portals/{id}", name="portals-get")
     * @Method({"GET"})
     */
    public function wsPortalsGetAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        if (!empty($principal)) {

            try {

                $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view, &$serializer, &$principal) {

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findOneBy([ 'id' => $request->attributes->get('id'), 'user' => $user ], [])
                    ;

                    $view['portal'] = $portal;
                });

            } catch (\Exception $e) {

                $view['error'] = [
                    'message' => 'Internal server error',
                    'message2' => $e->getMessage(),
                ];

                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response->setStatusCode(Response::HTTP_OK);

        } else {

            $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
        }

        $response->setContent($serializer->serialize($view, 'json', $this->context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/ws/portals/{id}", name = "portals-remove")
     * @Method({"DELETE"})
     */
    public function wsPortalsRemoveAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        if (!empty($principal)) {

            try {

                $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$principal) {

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findOneBy([ 'id' => $request->attributes->get('id'), 'user' => $user ])
                    ;

                    $em->remove($portal);

                    $em->flush();
                });

            } catch (\Exception $e) {

                $view['error'] = [
                    'message' => 'Internal server error',
                    'message2' => $e->getMessage(),
                ];

                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response->setStatusCode(Response::HTTP_OK);

        } else {

            $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
        }

        $response->setContent($serializer->serialize($view, 'json', $this->context));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/ws/portals", name = "portals")
     * @Method({"GET"})
     */
    public function wsPortalsAction(Request $request) {

        $principal = $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
            ? $this->get('security.token_storage')->getToken()->getUser()
            : null
        ;

        $response = new Response();

        $view = [];

        if (!empty($principal)) {

            $view['principal'] = $principal;

            try {

                $em = $this->getDoctrine()->getManager();

                $em->getConnection()->transactional(function($conn) use (&$em, &$principal, &$view) {

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->findById($principal->getId())
                    ;

                    $view['portals'] = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findBy([ 'user' => $user ], ['title' => 'asc'])
                    ;
                });

                $response->setStatusCode(Response::HTTP_OK);

            } catch (\Exception $e) {
                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
                $view['error'] = [
                    'message' => 'Internal server error',
                ];
            }

        } else {
            $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
        }

        $serializer = $this->container->get('jms_serializer');

        $response->setStatusCode(Response::HTTP_OK);
        $response->setContent($serializer->serialize($view, 'json', $this->context));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/{any}", name = "home", requirements = { "any"="(.*)" })
     */
    public function defaultAction(Request $request) {

        // TODO $domain = ... Взять его нужно по имени домена, с которого открыт ресурс

        $em = $this->getDoctrine()->getManager();

        $view = [
            'principal' => $this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
                ? $this->get('security.token_storage')->getToken()->getUser()
                : null
        ];

        return $this->render('public.html.twig', $view);
    }

}
