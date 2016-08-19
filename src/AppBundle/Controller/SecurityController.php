<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

use JMS\Serializer\SerializationContext;

use AppBundle\Entity\User;
use AppBundle\Security\UserPrincipal;

class SecurityController extends Controller {

    public function __construct() {
        $this->context = new SerializationContext();
        $this->context->setSerializeNull(true);
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
        $response->setContent($serializer->serialize([], 'json', $this->context));
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
                    ->getRepository('AppBundle:User')
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
                'message2' => $e->getMessage()
            ];

            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $this->get('security.token_storage')->setToken($token);
        $this->get('session')->set('_security_main', serialize($token));

        $response->setContent($serializer->serialize($view, 'json', $this->context));

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
                    ->getRepository('AppBundle:User')
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

        $response->setContent($serializer->serialize($view, 'json', $this->context));

        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

}
