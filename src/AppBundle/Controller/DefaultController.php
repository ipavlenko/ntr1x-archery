<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Resource;
use NTR1X\LayoutBundle\Entity\Portal;
use NTR1X\LayoutBundle\Entity\User;
use NTR1X\LayoutBundle\Security\UserPrincipal;

class DefaultController extends Controller {

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
                        ->getRepository('NTR1XLayoutBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = (new Portal())
                        ->setTitle($data['title'])
                        ->setUser($user)
                        ->setResource(new Resource())
                    ;

                    $em->persist($portal);
                    $em->flush();

                    $resource = $portal->getResource();

                    $resource
                        ->setName("/portals/{$portal->getId()}")
                        // ->setParams([])
                    ;

                    $em->persist($resource);
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

        $response->setContent($serializer->serialize($view, 'json'));
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
                        ->getRepository('NTR1XLayoutBundle:User')
                        ->findById($principal->getId())
                    ;

                    $view['portals'] = $this
                        ->getDoctrine()
                        ->getRepository('NTR1XLayoutBundle:Portal')
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
        dump($view);
        $response->setContent($serializer->serialize($view, 'json'));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/ws/signout", name = "signout")
     */
    public function wsSignoutAction(Request $request) {

        $this->get('security.token_storage')->setToken(null);
        $this->get('session')->remove('_security_main');

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();
        $response->setStatusCode(Response::HTTP_OK);
        $response->setContent($serializer->serialize([], 'json'));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/ws/signin", name = "signin")
     */
    public function wsSigninAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        $token = null;

        try {

            $principal = null;

            $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$principal) {

                $data = $serializer->deserialize($request->getContent(), 'array', 'json');

                $user = $this
                    ->getDoctrine()
                    ->getRepository('NTR1XLayoutBundle:User')
                    ->findOneBy([ 'email' => $data['email'] ])
                ;

                if ($user != null && password_verify($data['password'], $user->getPwdhash())) {

                    $principal = new UserPrincipal(
                        $user->getId(),
                        $user->getEmail()
                    );
                }
            });

            if (!empty($principal)) {
                $view['principal'] = $principal;
                $token = new UsernamePasswordToken($principal, null, 'main', [ 'ROLE_USER' ]);
                $response->setStatusCode(Response::HTTP_OK);
            } else {
                $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
            }

        } catch(\Exception $e) {

            $view['error'] = [
                'message' => 'The email already in use',
            ];

            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $this->get('security.token_storage')->setToken($token);
        $this->get('session')->set('_security_main', serialize($token));

        $response->setContent($serializer->serialize($view, 'json'));

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/ws/signup", name = "signup")
     */
    public function wsSignupAction(Request $request) {

        $em = $this->getDoctrine()->getManager();

        $view = [];

        $serializer = $this->container->get('jms_serializer');

        $response = new Response();

        try {

            $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$serializer, &$view) {

                $data = $serializer->deserialize($request->getContent(), 'array', 'json');

                $user = (new User())
                    ->setEmail($data['email'])
                    ->setPwdhash(password_hash($data['password'], PASSWORD_DEFAULT))
                ;

                $em->persist($user);
                $em->flush();

                $view['principal'] = $this
                    ->getDoctrine()
                    ->getRepository('NTR1XLayoutBundle:User')
                    ->find($user->getId())
                ;
            });

            $response->setStatusCode(Response::HTTP_OK);

        } catch(\Exception $e) {

            $view['error'] = [
                'message' => 'The email already in use',
            ];

            $response->setStatusCode(Response::HTTP_CONFLICT);
        }

        $response->setContent($serializer->serialize($view, 'json'));

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

        // $
        // $view['principal'] =

        // $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {

        // });
        //
        // $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {
        //
        //     $host = $request->getHost();
        //
        //     $view['model'] = [
        //
        //         'domains' => $this
        //             ->getDoctrine()
        //             ->getRepository('NTR1XLayoutBundle:Domain')
        //             ->findBy([], ['name'=>'asc'])
        //         ,
        //
        //         'pages' => $this
        //             ->getDoctrine()
        //             ->getRepository('NTR1XLayoutBundle:Page')
        //             ->findBy([], ['name'=>'asc'])
        //         ,
        //
        //         'schemes' => $this
        //             ->getDoctrine()
        //             ->getRepository('NTR1XLayoutBundle:Schema')
        //             ->findBy([], ['name'=>'asc'])
        //         ,
        //     ];
        //
        //     $view['settings'] = [
        //
        //         'widgets' => $this
        //             ->get('ntr1_x_layout.widget.manager')
        //             ->getWidgets()
        //         ,
        //
        //         'categories' => $this
        //             ->get('ntr1_x_layout.category.manager')
        //             ->getCategories()
        //         ,
        //     ];
        //
        // });

        return $this->render('public.html.twig', $view);
    }

    // /**
    //  * @Route("/admin", name = "admin")
    //  */
    // public function adminAction(Request $request) {
    //
    //     // TODO $domain = ... Взять его нужно по имени домена, с которого открыт ресурс
    //
    //     $em = $this->getDoctrine()->getManager();
    //
    //     $view = [
    //         'settings' => []
    //     ];
    //
    //     $em->getConnection()->transactional(function($conn) use (&$em, &$request, &$view) {
    //
    //         $host = $request->getHost();
    //
    //         $view['model'] = [
    //
    //             'domains' => $this
    //                 ->getDoctrine()
    //                 ->getRepository('NTR1XLayoutBundle:Domain')
    //                 ->findBy([], ['name'=>'asc'])
    //             ,
    //
    //             'pages' => $this
    //                 ->getDoctrine()
    //                 ->getRepository('NTR1XLayoutBundle:Page')
    //                 ->findBy([], ['name'=>'asc'])
    //             ,
    //
    //             'schemes' => $this
    //                 ->getDoctrine()
    //                 ->getRepository('NTR1XLayoutBundle:Schema')
    //                 ->findBy([], ['name'=>'asc'])
    //             ,
    //         ];
    //
    //         $view['settings'] = [
    //
    //             'widgets' => $this
    //                 ->get('ntr1_x_layout.widget.manager')
    //                 ->getWidgets()
    //             ,
    //
    //             'categories' => $this
    //                 ->get('ntr1_x_layout.category.manager')
    //                 ->getCategories()
    //             ,
    //         ];
    //
    //     });
    //
    //     return $this->render('private.html.twig', $view);
    // }
}
