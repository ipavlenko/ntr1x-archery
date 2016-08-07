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

class DefaultController extends Controller {

    public function __construct() {
        $this->context = new SerializationContext();
        $this->context->setSerializeNull(true);
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
