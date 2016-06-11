<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

class DefaultController extends Controller {

    /**
     * @Route("/do/signin", name = "signin")
     */
    public function doSigninAction(Request $request) {

        $em = $this->getDoctrine()->getManager();
        dump($request);
    }

    /**
     * @Route("/do/signup", name = "signup")
     */
    public function doSignupAction(Request $request) {

        $em = $this->getDoctrine()->getManager();
        dump($request);
    }

    /**
     * @Route("/{any}", name = "home", requirements = { "any"="(|gallery|storage|signin|signup)" })
     */
    public function defaultAction(Request $request) {

        // TODO $domain = ... Взять его нужно по имени домена, с которого открыт ресурс

        $em = $this->getDoctrine()->getManager();

        $view = [
            'settings' => []
        ];
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
