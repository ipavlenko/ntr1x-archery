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
use AppBundle\Entity\Publication;
use AppBundle\Entity\Upload;
use AppBundle\Entity\User;
use AppBundle\Security\UserPrincipal;

class PublicationsController extends Controller {

    public function __construct() {
        $this->context = new SerializationContext();
        $this->context->setSerializeNull(true);
    }

    /**
     * @Route("/ws/publications", name="publications-create")
     * @Method({"POST"})
     */
    public function wsPublicationsCreateAction(Request $request) {

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

                    $user = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:User')
                        ->find($principal->getId())
                    ;

                    $portal = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Portal')
                        ->findOneBy([ 'id' => $request->request->get('portal'), 'user' => $user ])
                    ;

                    $publication = (new Publication())
                        ->setPortal($portal)
                        ->setTitle($request->request->get('title'))
                        ->setUser($user)
                        ->setThumbnail(
                            (new Upload())
                                ->setDir('publications/thumbnails')
                                ->setFile($request->files->get('thumbnail'))
                        )
                    ;

                    $em->persist($publication);
                    $em->flush();

                    $em->clear();

                    $view['publication'] = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Publication')
                        ->findOneBy([ 'id' => $publication->getId() ])
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
     * @Route("/ws/publications/{id}", name = "publications-remove")
     * @Method({"DELETE"})
     */
    public function wsPublicationsRemoveAction(Request $request) {

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

                    $publication = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Publication')
                        ->findOneBy([ 'id' => $request->attributes->get('id'), 'user' => $user ])
                    ;

                    $em->remove($publication);

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
     * @Route("/ws/publications", name="publications-get")
     * @Method({"GET"})
     */
    public function wsPublicationsAction(Request $request) {

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

                    $view['publications'] = $this
                        ->getDoctrine()
                        ->getRepository('AppBundle:Publication')
                        ->findBy([ 'user' => $user ], ['order' => 'asc' ])
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

}
